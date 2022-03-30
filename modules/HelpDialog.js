import {Dialog, DialogContent, DialogTitle, Link, Typography} from "@mui/material";
import {FormattedMessage, useIntl, defineMessages} from "react-intl";

function HelpDialog(props) {
	const intl = useIntl();
	const msgs = defineMessages({
		name: {id: "helper.name"},
		urlText: {id: `helper.${intl.locale === 'zh' ? 'NGAOrigin' : 'uniOrigin'}`},
		url: {id: `helper.${intl.locale === 'zh' ? 'NGAURL' : 'uniURL'}`}
	})

	return (
		<Dialog {...props}>
			<DialogTitle>
				<FormattedMessage id="helper.title" />
			</DialogTitle>
			<DialogContent>
				<Typography variant="body1">
					<FormattedMessage
						id="helper.origin"
						values={{
							name: child => <Typography variant="body1" sx={{fontWeight: "bold"}} component="span" >{child}</Typography>,
							nameText: intl.formatMessage(msgs.name),
						}}
					/>
				</Typography>
				<Typography variant="body1">
					<FormattedMessage
						id="helper.dataOrigin"
						values={{
							uni: child => <Link href="https://www.universalis.app" target="_blank" rel="noopener noreferrer" underline="hover" >{child}</Link>,
							url: child => <Link href={intl.formatMessage(msgs.url)} target="_blank" rel="noopener noreferrer" underline="hover" >{child}</Link>,
							urlText: intl.formatMessage(msgs.urlText),
						}}
					/>
				</Typography>
				<Typography variant="body1">
					<FormattedMessage id="helper.other" />
				</Typography>
			</DialogContent>
		</Dialog>)
}


export default HelpDialog;