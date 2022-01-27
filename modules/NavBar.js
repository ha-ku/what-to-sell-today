import {
	AppBar,
	Box,
	FormControl,
	IconButton,
	ListSubheader,
	MenuItem,
	TextField,
	Toolbar,
	Typography
} from "@mui/material";
import {Help as HelpIcon, Menu as MenuIcon} from "@mui/icons-material";
import HelpDialog from "./HelpDialog";
import {useState} from "react";
import {useHotkeys} from "react-hotkeys-hook";
import {StyledCircularProgress} from "./styledComponents";

function NavBar({ listSource, handleSource, onMenu, sources, isLoading}) {
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

	return (
		<AppBar position="sticky">
			<Toolbar>
				<IconButton edge="start" color="inherit" aria-label="menu" onClick={onMenu}>
					<MenuIcon />
				</IconButton>
				<Typography variant="h6">今天</Typography>
				<FormControl>
					<TextField select SelectProps={SelectProps} value={listSource} onChange={handleSource} autoWidth={true} size="small" variant="standard">
						{Object.keys(headers).reduce((acc, category) => {
							return acc.concat(
								(<ListSubheader key={category}>{category}</ListSubheader>),
								Object.keys(headers[category]).map(sourceName => (
									<MenuItem value={sourceName} key={sourceName}>
										<Typography variant="h6">{sources[sourceName].target}</Typography>
									</MenuItem>
								))
							)
						}, [])}
					</TextField>
				</FormControl>
				<Typography variant="h6">{sources[listSource].action}什么划算？</Typography>
				{isLoading ? <StyledCircularProgress color="secondary" size={30} thickness={2.7} /> : null}
				<Box sx={{ flexGrow: 1 }} />
				<HelpIcon onClick={() => setHelp(h => !h)} />
				<HelpDialog open={help} onClose={() => setHelp(false)}/>
			</Toolbar>
		</AppBar>
	);
}


export default NavBar