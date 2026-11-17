import {useEffect, type ReactNode} from 'react'
import {useShallow} from 'zustand/react/shallow'
import {useTranslation} from 'react-i18next'
import {AlertTriangle, ChevronDown} from 'lucide-react'
import {UI_STYLES, uiStyleSchema} from '@shared/schemas.js'
import {BASE_STYLE, STYLES} from '../../styles/registry.js'
import {selectBackdropAvailability} from '../../store/uiSlice.js'
import {useAppStore} from '../../store/useAppStore.js'
import type {AdvancedSettingsTarget} from '../../store/types.js'
import {cn} from '../../lib/utils.js'
import {Alert, AlertDescription} from '../ui/alert.js'
import {Button} from '../ui/button.js'
import {Card} from '../ui/card.js'
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from '../ui/collapsible.js'
import {Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldTitle} from '../ui/field.js'
import {InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput} from '../ui/input-group.js'
import {ToggleGroup} from '../ui/toggle-group.js'
import {SettingSwitch} from '../shared/SettingSwitch.js'
import {Panel} from '../shared/Panel.js'
import {OptionCard} from '../shared/OptionCard.js'
import {HotkeySettingsSection} from './HotkeySettingsSection.js'
import {PlaylistProbeLimitSelector} from './PlaylistProbeLimitSelector.js'
import {ExploreSettingsPanel} from '../explore/ExploreSettingsPanel.js'
import {BehaviorSettingsPanel, EssentialDownloadFields} from './BehaviorSettingsPanel.js'
import {CookiesSettingsFields} from './CookiesSettingsFields.js'

const ADVANCED_SETTINGS_TARGET_TEST_IDS: Record<AdvancedSettingsTarget, string> = {cookies: 'cookies-source', network: 'network-pacing-section', hotkey: 'hotkey-section'}

export function DownloadProfilesSettingsTab(): ReactNode {
	const {t} = useTranslation()
	const hasBrokenCookies = useAppStore(state => state.notWorkingSignIns.length > 0)
	const {advancedAutoOpen, advancedAutoTarget, settingsAdvancedExpanded, setAdvancedAutoOpen, setSettingsAdvancedExpanded} = useAppStore(
		useShallow(state => ({advancedAutoOpen: state.advancedAutoOpen, advancedAutoTarget: state.advancedAutoTarget, settingsAdvancedExpanded: state.settingsAdvancedExpanded, setAdvancedAutoOpen: state.setAdvancedAutoOpen, setSettingsAdvancedExpanded: state.setSettingsAdvancedExpanded}))
	)
	const advancedOpen = settingsAdvancedExpanded || advancedAutoOpen || hasBrokenCookies

	useEffect(() => {
		if (!advancedAutoOpen) return
		const targetTestId = ADVANCED_SETTINGS_TARGET_TEST_IDS[advancedAutoTarget]
		const target = document.querySelector(`[data-testid="${targetTestId}"]`)
		if (target instanceof HTMLElement) {
			target.scrollIntoView?.({block: 'center', behavior: 'smooth'})
		}
		setAdvancedAutoOpen(false, advancedAutoTarget)
	}, [advancedAutoOpen, advancedAutoTarget, setAdvancedAutoOpen])

	return (
		<Card variant="glass" className="mx-auto w-full max-w-2xl gap-4 px-4" data-testid="profiles-settings-tab">
			<GeneralSettingsPanel />

			<ExploreSettingsPanel />

			<Collapsible open={advancedOpen} onOpenChange={setSettingsAdvancedExpanded} className="rounded-xl border border-border-subtle/80 bg-background/25 p-3">
				<CollapsibleTrigger
					render={
						<Button type="button" variant="ghost" className="h-auto w-full justify-between gap-3 px-0 py-0 text-left whitespace-normal hover:bg-transparent" data-testid="settings-advanced-toggle">
							<span className="flex flex-col gap-0.5">
								<span className="text-sm font-medium text-foreground">{t('wizard.url.settings.advancedHeading')}</span>
								<span className="text-xs font-normal text-subtle-foreground">{t('wizard.url.settings.advancedDescription')}</span>
							</span>
							<ChevronDown className={cn('size-4 shrink-0 text-subtle-foreground transition-transform', advancedOpen ? 'rotate-180' : '')} aria-hidden />
						</Button>
					}
				/>
				<CollapsibleContent className="flex flex-col gap-4 pt-4">
					<AdvancedInputPanel />

					<Panel testId="hotkey-section" title={t('wizard.url.hotkey.sectionTitle')} description={t('wizard.url.hotkey.sectionDescription')}>
						<HotkeySettingsSection />
					</Panel>

					<BehaviorSettingsPanel />
				</CollapsibleContent>
			</Collapsible>

			{import.meta.env.MODE === 'test' ? <StyleSettingsPanel /> : null}
		</Card>
	)
}

function GeneralSettingsPanel(): ReactNode {
	const {t} = useTranslation()
	const {settings, setClipboardWatchEnabled} = useAppStore(useShallow(state => ({settings: state.settings, setClipboardWatchEnabled: state.setClipboardWatchEnabled})))
	return (
		<Panel title={t('wizard.url.settings.generalHeading')} description={t('wizard.url.settings.generalDescription')}>
			<FieldGroup className="gap-4">
				<SettingSwitch id="profiles-settings-clipboard" label={t('wizard.url.clipboard.toggle')} description={t('wizard.url.clipboard.toggleDescription')} checked={settings?.common?.clipboardWatchEnabled ?? false} onCheckedChange={checked => void setClipboardWatchEnabled(checked)} />
				<EssentialDownloadFields />
			</FieldGroup>
		</Panel>
	)
}

function AdvancedInputPanel(): ReactNode {
	const {t} = useTranslation()
	return (
		<Panel title={t('wizard.url.advanced')}>
			<FieldGroup className="gap-4">
				<CookiesSettingsFields />

				<ProxyUrlField />

				<Field orientation="horizontal" className="items-start justify-between gap-3" data-testid="playlist-probe-limit-section">
					<FieldContent className="gap-0.5">
						<FieldTitle id="profiles-settings-playlist-probe-limit">{t('wizard.url.playlistProbeLimit.label')}</FieldTitle>
						<FieldDescription>{t('wizard.url.playlistProbeLimit.description')}</FieldDescription>
					</FieldContent>
					<PlaylistProbeLimitSelector testId="profiles-settings-playlist-probe-limit" className="w-40" showCurrent={false} />
				</Field>
			</FieldGroup>
		</Panel>
	)
}

function ProxyUrlField(): ReactNode {
	const {t} = useTranslation()
	const {settings, setProxyUrl} = useAppStore(useShallow(state => ({settings: state.settings, setProxyUrl: state.setProxyUrl})))
	const proxyUrl = settings?.common?.proxyUrl ?? ''
	return (
		<Field className="gap-1.5">
			<FieldContent className="gap-0.5">
				<FieldLabel htmlFor="profiles-settings-proxy-url">{t('wizard.url.proxy.label')}</FieldLabel>
				<FieldDescription>{t('wizard.url.proxy.description')}</FieldDescription>
			</FieldContent>
			<InputGroup className="h-9">
				<InputGroupInput id="profiles-settings-proxy-url" type="url" value={proxyUrl} onChange={event => void setProxyUrl(event.target.value)} placeholder={t('wizard.url.proxy.placeholder')} className="text-xs font-mono" data-testid="profiles-settings-proxy-url" />
				<InputGroupAddon align="inline-end">
					<InputGroupButton type="button" onClick={() => void setProxyUrl('')} disabled={!proxyUrl}>
						{t('wizard.url.proxy.clear')}
					</InputGroupButton>
				</InputGroupAddon>
			</InputGroup>
		</Field>
	)
}

function StyleSettingsPanel(): ReactNode {
	const {t} = useTranslation()
	const {uiStyle, setUiStyle} = useAppStore(useShallow(state => ({uiStyle: state.uiStyle, setUiStyle: state.setUiStyle})))
	const backdropAvailability = useAppStore(selectBackdropAvailability)
	const styleFallsBack = STYLES[uiStyle].backdrop !== null && backdropAvailability === 'blocked'
	return (
		<Panel title={t('wizard.url.style.panelTitle')} description={t('wizard.url.style.panelDescription')}>
			<Field className="gap-2">
				<FieldContent className="gap-0.5">
					<FieldTitle id="profiles-settings-style-label">{t('wizard.url.style.modeLabel')}</FieldTitle>
					<FieldDescription>{t('wizard.url.style.modeDescription')}</FieldDescription>
				</FieldContent>
				<ToggleGroup
					variant="outline"
					value={[uiStyle]}
					onValueChange={value => {
						const next = uiStyleSchema.safeParse(value[0])
						if (next.success) setUiStyle(next.data)
					}}
					spacing={1}
					className="grid w-full grid-cols-[repeat(auto-fit,minmax(10.5rem,1fr))] gap-2"
					aria-labelledby="profiles-settings-style-label"
					data-testid="profiles-settings-style"
				>
					{UI_STYLES.map(style => (
						<OptionCard key={style} value={style} title={t(STYLES[style].labelKey)} description={t(STYLES[style].descriptionKey)} className="w-full" data-testid={`profiles-settings-style-${style}`} />
					))}
				</ToggleGroup>
				{styleFallsBack ? (
					<Alert size="sm" data-testid="profiles-settings-style-fallback">
						<AlertTriangle className="size-4" aria-hidden />
						<AlertDescription>{t('wizard.url.style.unavailableNotice', {style: t(STYLES[uiStyle].labelKey), fallback: t(STYLES[BASE_STYLE].labelKey)})}</AlertDescription>
					</Alert>
				) : null}
			</Field>
		</Panel>
	)
}
