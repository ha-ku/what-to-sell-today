import {Dialog, DialogContent, DialogTitle, Link, Typography} from "@mui/material";
import strings from './localization';

function HelpDialog(props) {
	return (
		<Dialog {...props}>
			<DialogTitle>{strings.helperTitle}</DialogTitle>
			<DialogContent>
				<Typography variant="body1">
					{strings.formatString(strings.helperOrigin,
						<Typography variant="body1" sx={{fontWeight: "bold"}} component="span">
							{strings.helperName}
						</Typography>)
					}
				</Typography>
				<Typography variant="body1">
					{strings.formatString(strings.helperDataOrigin,
						<Link href="https://www.universalis.app" target="_blank" rel="noopener noreferrer" underline="hover">
							universalis.app
						</Link>,
						<Link href={strings.getLanguage() === 'zh' ? strings.helperNGAURL : strings.helperUniURL} target="_blank" rel="noopener noreferrer" underline="hover">
							{strings.getLanguage() === 'zh' ? strings.helperNGAOrigin : strings.helperUniOrigin}
						</Link>
					)}
				</Typography>
				<Typography variant="body1">
					{strings.helperOther}
				</Typography>
			</DialogContent>
		</Dialog>)
}


export default HelpDialog;