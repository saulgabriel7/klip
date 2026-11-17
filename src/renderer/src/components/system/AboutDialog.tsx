import {type ReactNode} from 'react'
import {useShallow} from 'zustand/react/shallow'
import {useTranslation} from 'react-i18next'
import {ExternalLink} from 'lucide-react'
import {SourceCapabilityStrip} from '../shared/SourceCapabilityStrip.js'
import {Button} from '../ui/button.js'
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '../ui/dialog.js'
import {useAppStore} from '../../store/useAppStore.js'
import appIcon from '../../assets/App-icon-HQ.png'

const GITHUB_URL = 'https://github.com/saulgabriel7/klip'
const NOTICES_URL = 'https://github.com/saulgabriel7/klip/blob/main/THIRD_PARTY_NOTICES.txt'

function openExternalUrl(url: string): void {
	void window.appApi.shell.openExternal(url)
}

export function AboutDialog(): ReactNode {
	const {t} = useTranslation()
	const {aboutDialogOpen, setAboutDialogOpen} = useAppStore(useShallow(state => ({aboutDialogOpen: state.aboutDialogOpen, setAboutDialogOpen: state.setAboutDialogOpen})))

	return (
		<Dialog open={aboutDialogOpen} onOpenChange={setAboutDialogOpen}>
			<DialogContent data-testid="about-dialog">
				<DialogHeader className="items-center text-center">
					<img src={appIcon} alt="" width={64} height={64} className="object-contain dark:invert" draggable={false} />
					<DialogTitle className="text-lg font-semibold tracking-tight">Klip</DialogTitle>
					<span className="text-xs text-muted-foreground tabular-nums">v{window.appVersion}</span>
					<DialogDescription className="text-center">{t('about.tagline')}</DialogDescription>
				</DialogHeader>

				<div className="flex flex-wrap justify-center gap-2">
					<Button type="button" variant="outline" size="sm" onClick={() => openExternalUrl(GITHUB_URL)} data-testid="about-link-github">
						{t('about.githubLink')}
						<ExternalLink size={12} aria-hidden />
					</Button>
				</div>

				<SourceCapabilityStrip testId="about-capabilities" className="mx-auto w-full" />

				<div className="flex flex-col items-center gap-2 text-center text-xs text-muted-foreground">
					<span>{t('about.licenseLine')}</span>
					<Button type="button" variant="link" size="inline" onClick={() => openExternalUrl(NOTICES_URL)} className="text-muted-foreground underline hover:text-foreground" data-testid="about-link-notices">
						{t('about.thirdPartyNotices')}
						<ExternalLink className="size-3" aria-hidden />
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
