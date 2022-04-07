import {
	AppBar,
	Box,
	FormControl,
	IconButton, LinearProgress,
	ListSubheader,
	MenuItem,
	TextField,
	Toolbar,
	Typography, useMediaQuery
} from "@mui/material";
import {Help as HelpIcon, Menu as MenuIcon, Translate as TranslateIcon} from "@mui/icons-material";
import HelpDialog from "./HelpDialog";
import {useState} from "react";
import {useHotkeys} from "react-hotkeys-hook";
import useTranslate from "./useTranslate";


function NavBar({ listSource, handleSource, onMenu, sources, isLoading, setLocale}) {
	const [help, setHelp] = useState(false),
		headers = Object.keys(sources).reduce((acc, sourceName) => {
			const source = sources[sourceName];
			if(!acc.hasOwnProperty(source.category)) {
				acc[source.category] = {};
			}
			acc[source.category][sourceName] = sources[sourceName];
			return acc;
		}, {});

	const [selectOpen, setSelectOpen] = useState(false);
	const SelectProps = {
		open: selectOpen,
		onOpen: () => setSelectOpen(true),
		onClose: () => setSelectOpen(false)
	}
	useHotkeys('up,down', (event) => {
		if(!selectOpen) {
			setSelectOpen(true);
			event.preventDefault();
		}
	}, [selectOpen]);

	const { FormattedMessage, locale, t } = useTranslate('navbar');

	const isMobile = !useMediaQuery(t => t.breakpoints.up('sm'));

	return (
		<AppBar position="sticky" sx={{paddingTop: '4px'}} >
			<Toolbar>
				<IconButton edge="start" color="inherit" aria-label="menu" onClick={onMenu}>
					<MenuIcon />
				</IconButton>
				<Box sx={{display: 'inline-flex', flexDirection: isMobile && locale !=='zh' ? 'column' : 'row'}}>
					<Typography variant={isMobile && locale !=='zh' ? 'subtitle2' : 'h6'} sx={{whiteSpace: 'pre', flex: "none", ...(isMobile && locale !=='zh' ? {lineHeight: 1} : {})}} >
						<FormattedMessage id="prefix" values={{action: t(sources[listSource].action)}} />
					</Typography>
					<FormControl>
						<TextField select SelectProps={SelectProps} value={listSource} onChange={handleSource} size="small" variant="standard" sx={{flex: "none"}}>
							{Object.keys(headers).reduce((acc, category) => {
								return acc.concat(
									(<ListSubheader key={category}>{t(category)}</ListSubheader>),
									Object.keys(headers[category]).map(sourceName => (
										<MenuItem value={sourceName} key={sourceName}>
											<Typography variant="h6">{t(sources[sourceName].target)}</Typography>
										</MenuItem>
									))
								)
							}, [])}
						</TextField>
					</FormControl>
					<Typography variant={isMobile && locale !=='zh' ? 'subtitle2' : 'h6'} sx={{whiteSpace: 'pre', flex: "none", ...(isMobile && locale !=='zh' ? {lineHeight: 1} : {})}} >
						<FormattedMessage id="postfix" values={{action: t(sources[listSource].action)}} />
					</Typography>
				</Box>
				{isLoading ? <LinearProgress color="secondary" sx={{position: "fixed", top: 0, left: 0, width: '100%'}}/> : null}
				<Box sx={{ flexGrow: 1 }} />
				<IconButton aria-label="switch language" onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')} >
					<TranslateIcon />
				</IconButton>
				<IconButton aria-label="about" onClick={() => setHelp(h => !h)} >
					<HelpIcon />
				</IconButton>
				<HelpDialog open={help} onClose={() => setHelp(false)}/>
			</Toolbar>
		</AppBar>
	);
}


export default NavBar