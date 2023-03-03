// noinspection RequiredAttributes

import {
	AppBar,
	Box, Collapse,
	FormControl,
	IconButton, ListItemText,
	MenuItem, Select,
	Toolbar,
	Typography, useMediaQuery
} from "@mui/material";
import {
	ArrowDropDown as ArrowDropDownIcon,
	ArrowDropUp as ArrowDropUpIcon,
	Help as HelpIcon,
	Menu as MenuIcon,
	Translate as TranslateIcon
} from "@mui/icons-material";
import HelpDialog from "./HelpDialog";
import {memo, useState} from "react";
import {useHotkeys} from "react-hotkeys-hook";
import useTranslate from "./useTranslate";
import {useTheme} from "@mui/material/styles";
import {colord, extend} from "colord";
import {useDispatch} from 'react-redux';
import mixPlugin from "colord/plugins/mix";
import {configAction} from "./config/configSlice";
extend([mixPlugin]);


function NavBar({ listSource, handleSource, onMenu, sources}) {
	//console.log('rerender NavBar');
	const {setLocale} = configAction,
		dispatch = useDispatch();
	const headers = Object.keys(sources).reduce((acc, sourceName) => {
			const category = sources[sourceName].category;
			acc[category] = [...(acc[category] ?? []), sourceName];
			return acc;
		}, {});

	const [helpOpen, setHelpOpen] = useState(false),
		[open, setOpen] = useState(false);

	useHotkeys('up,down', (event) => {
		if(!open) {
			setOpen(true);
			event.preventDefault();
		}
	}, [open]);

	const { FormattedMessage, locale, t } = useTranslate('navbar');
	const isMobile = !useMediaQuery(t => t.breakpoints.up('sm'));

	const theme = useTheme();

	const [visibleSelectCategory, setVisibleSelectCategory] = useState(''),
		[anchorEl, setAnchorEl] = useState(null),
		onOpen = (e) => {
			setOpen(true);
			setAnchorEl(e.currentTarget);
		},
		onClose = (e) => {
			if(typeof headers[e.currentTarget.getAttribute("data-value")] !== 'undefined' && e.type === 'click')
				return;
			setVisibleSelectCategory('');
			setOpen(false)
		},
		onChange = function openSubMenu({target: {value}}) {
			setVisibleSelectCategory(v => v === value ? '' : value);
		},
		selectProps = {
			open, onOpen, onClose, onChange, size: "small", variant: "standard",
			MenuProps: {
				anchorEl,
				anchorOrigin: { vertical: 'bottom', horizontal: 'left',},
				transformOrigin: { vertical: 'top', horizontal: 'left',}
			}
		}

	return (
		<AppBar position="sticky" >
			<Toolbar>
				<IconButton edge="start" color="inherit" aria-label="menu" onClick={onMenu}>
					<MenuIcon />
				</IconButton>
				<Box sx={{display: 'inline-flex', flexDirection: isMobile && locale !=='zh' ? 'column' : 'row', paddingTop: '4px'}}>
					<Typography variant={isMobile && locale !=='zh' ? 'subtitle2' : 'h6'} sx={{whiteSpace: 'pre', flex: "none", ...(isMobile && locale !=='zh' ? {lineHeight: 1} : {})}} >
						<FormattedMessage id="prefix" values={{action: t(sources[listSource].action)}} />
					</Typography>
					<FormControl>
						<Select {...selectProps} value={listSource} >
							{Object.keys(headers).reduce((acc, category) =>
									[...acc,
										(<MenuItem key={`${category}Title`} value={category} sx={{paddingRight: theme.spacing(1)}}>
											<ListItemText sx={{marginRight: theme.spacing(1)}}>
												<Typography variant="h6">{t(category)}</Typography>
											</ListItemText>
											{category === visibleSelectCategory ?
												<ArrowDropUpIcon />
												: <ArrowDropDownIcon />}
										</MenuItem>),
										(<Collapse in={category === visibleSelectCategory} key={`${category}SubMenu`}
												   sx={{
													   paddingLeft: theme.spacing(1),
													   backgroundColor: colord(theme.palette.background.paper)
														   .mix(theme.palette.primary.main, 0.15)
														   .toRgbString()
												   }}>
											{headers[category].map((sourceName) =>
												(<MenuItem value={sourceName} key={sourceName} onClick={
													e => {
														setOpen(false)
														handleSource({target: {value: e.currentTarget.getAttribute('value')}});
													}}>
													<Typography variant="h6">{t(sources[sourceName].target)}</Typography>
												</MenuItem>)
											)}
										</Collapse>)
									],
								[(<MenuItem key="hidden" value={listSource} sx={{display: 'none'}}>
									<Typography variant="h6">{t(sources[listSource].target)}</Typography>
								</MenuItem>)]
							)}
						</Select>
					</FormControl>
					<Typography variant={isMobile && locale !=='zh' ? 'subtitle2' : 'h6'} sx={{whiteSpace: 'pre', flex: "none", ...(isMobile && locale !=='zh' ? {lineHeight: 1} : {})}} >
						<FormattedMessage id="postfix" values={{action: t(sources[listSource].action)}} />
					</Typography>
				</Box>
				<Box sx={{ flexGrow: 1 }} />
				<IconButton aria-label="switch language" onClick={() => dispatch(setLocale(locale === 'zh' ? 'en' : 'zh'))} >
					<TranslateIcon />
				</IconButton>
				<IconButton aria-label="about" onClick={() => setHelpOpen(h => !h)} >
					<HelpIcon />
				</IconButton>
				<HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)}/>
			</Toolbar>
		</AppBar>
	);
}


export default memo(NavBar)