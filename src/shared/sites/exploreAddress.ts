// What Enter in Explore's address bar does with the text. Pure: the renderer
// uses it to normalise and route what was typed, and main enforces the same
// rule (isExploreAddress) before the view loads anything.

import type {ExploreSearchEngine} from '../schemas.js'
import {exploreSearchUrl} from './exploreSearch.js'
import {hostMatches} from './hostRules.js'
import type {HostRule, SiteExplore} from './types.js'

// The longest address (and search text) the bar sends; anything longer is refused.
export const EXPLORE_ADDRESS_MAX = 2048

// What a typed address is judged against: the site's own hosts (written in the
// site's canonical https form) and the hosts never typed (sign-in, account and
// consent pages, reached only by clicking on a page).
export interface ExploreAddressScope {
	siteHosts: readonly HostRule[]
	blockedHosts: readonly HostRule[]
}

export function exploreAddressScope(explore: Pick<SiteExplore, 'contentHosts' | 'signInHosts' | 'consentHosts'>): ExploreAddressScope {
	return {siteHosts: explore.contentHosts, blockedHosts: [...explore.signInHosts, ...explore.consentHosts]}
}

// `link`: load it in the view. `search`: the chosen engine's search for the text.
// `refused`: nothing to do with it (another scheme, credentials, a sign-in,
// account or consent page, a link over the cap). `search-too-long`: search
// text whose search page would be over the cap.
export type ExploreAddress = {kind: 'link'; url: string} | {kind: 'search'; url: string} | {kind: 'refused'} | {kind: 'search-too-long'}

const WEB_PROTOCOLS = new Set(['http:', 'https:'])
// `scheme://…`, or a scheme a browser would run or open without one.
const SCHEMED = /^[a-z][a-z0-9+.-]*:\/\//i
const NON_WEB_SCHEME = /^(?:javascript|vbscript|data|file|blob|about|view-source|filesystem|chrome|devtools|mailto|tel):/i
// A bare host with a path (`vimeo.com/123`), or a bare web domain (`twitch.tv`,
// `vimeo.com`, `tiktok.com`, `example.com`). Single dotted tokens ending in
// common code/file extensions (`node.js`, `vue.js`, `config.json`) remain search text.
const BARE_HOST_WITH_PATH = /^[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}(?::\d+)?[/?#]\S*$/i
const BARE_HOST_ALONE = /^[a-z0-9-]+(?:\.[a-z0-9-]+)*\.([a-z]{2,})$/i
const NON_DOMAIN_EXTENSIONS = new Set(['js', 'ts', 'mjs', 'cjs', 'jsx', 'tsx', 'py', 'rb', 'go', 'rs', 'cs', 'cpp', 'java', 'php', 'sh', 'md', 'txt', 'json', 'yaml', 'yml', 'toml', 'xml', 'html', 'css', 'scss', 'sql', 'log', 'env', 'lock'])
// How a link starts: a scheme, `www.`, or a host followed by a path.
const LINK_START = /^(?:[a-z][a-z0-9+.-]*:\/\/|www\.|[^\s/?#]+\.[a-z]{2,}[/?#])/i
// `www.` names a web host whatever follows.
const WWW_HOST = /^www\.[^\s/?#]+\.[^\s/?#]+(?:[/?#]\S*)?$/i

function parse(raw: string): URL | null {
	try {
		return new URL(raw)
	} catch {
		return null
	}
}

// Main's rule for a typed address: a web page within the cap, with no
// credentials, never on a blocked host.
export function isExploreAddress(raw: string, scope: ExploreAddressScope): boolean {
	if (raw.length > EXPLORE_ADDRESS_MAX) return false
	const url = parse(raw)
	return url !== null && WEB_PROTOCOLS.has(url.protocol) && url.hostname !== '' && url.username === '' && url.password === '' && !hostMatches(url.hostname, scope.blockedHosts)
}

function isBareWebDomain(text: string): boolean {
	const match = BARE_HOST_ALONE.exec(text)
	if (!match) return false
	return !NON_DOMAIN_EXTENSIONS.has(match[1].toLowerCase())
}

// A link: a scheme, `www.`, a bare host with a path, or a bare web domain.
// Anything else (dotted file names or words) is search text.
function linkFor(text: string): URL | null | 'search' {
	if (NON_WEB_SCHEME.test(text)) return null
	if (SCHEMED.test(text)) return parse(text)
	if (WWW_HOST.test(text) || BARE_HOST_WITH_PATH.test(text) || isBareWebDomain(text)) return parse(`https://${text}`)
	return 'search'
}

export function classifyExploreAddress(input: string, explore: Pick<SiteExplore, 'canonicalAddress'>, scope: ExploreAddressScope, engine: ExploreSearchEngine): ExploreAddress {
	const text = input.trim()
	if (text === '') return {kind: 'refused'}
	// Over the cap, only the start is read (no full-length pattern match on a huge paste).
	if (text.length > EXPLORE_ADDRESS_MAX) return LINK_START.test(text.slice(0, 256)) || NON_WEB_SCHEME.test(text) ? {kind: 'refused'} : {kind: 'search-too-long'}
	const link = linkFor(text)
	if (link === 'search') {
		const url = exploreSearchUrl(engine, text)
		return url.length > EXPLORE_ADDRESS_MAX ? {kind: 'search-too-long'} : {kind: 'search', url}
	}
	if (!link) return {kind: 'refused'}
	let url = link
	// A site host on the default port is always loaded over https, in the site's own form.
	if (WEB_PROTOCOLS.has(link.protocol) && link.port === '' && hostMatches(link.hostname, scope.siteHosts)) {
		url = new URL(link.href)
		url.protocol = 'https:'
		url = explore.canonicalAddress?.(url) ?? url
	}
	return isExploreAddress(url.href, scope) ? {kind: 'link', url: url.href} : {kind: 'refused'}
}
