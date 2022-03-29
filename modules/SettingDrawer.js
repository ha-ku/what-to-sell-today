import {StyledButton, StyledFormControl, StyledFormControlLabel} from "./styledComponents";
import {
	Divider,
	Drawer,
	FormControlLabel,
	MenuItem,
	Radio,
	RadioGroup,
	Switch,
	TextField,
	Typography
} from "@mui/material";
import {servers, serversName, worlds, worldsName} from "./worldsAndServers";
import strings from './localization'


function SettingDrawer({open, userDarkMode, quality, considerTime, world, server, priceWindow, isLoading, sources, listSource}) {

	return (<Drawer anchor="left" open={open.value} onClose={open.handler} autoWidth>
		<StyledFormControl>
			<Typography variant="h5" mb={2}>{strings.drawerAppearance}</Typography>
			<StyledFormControlLabel label={strings.drawerTheme} labelPlacement="top" control={
				<RadioGroup value={userDarkMode.value} onChange={userDarkMode.handler} row>
					<FormControlLabel control={<Radio color="secondary" size="small" />} label={strings.drawerDay} value="light"/>
					<FormControlLabel control={<Radio color="secondary" size="small" />} label={strings.drawerNight} value="dark"/>
					<FormControlLabel control={<Radio color="secondary" size="small" />} label={strings.drawerAuto} value="auto"/>
				</RadioGroup>
			} sx={{marginLeft: 0}}/>
		</StyledFormControl>
		<Divider />
		<StyledFormControl>
			<Typography variant="h5" mb={2}>{strings.drawerAutoUpdate}</Typography>
			<StyledFormControlLabel label={strings.drawerQuality} labelPlacement="top" control={
				<RadioGroup value={quality.value} onChange={quality.handler} row>
					<FormControlLabel control={<Radio color="secondary" size="small" />} label={strings.drawerHQ} value="hq"/>
					<FormControlLabel control={<Radio color="secondary" size="small" />} label={strings.drawerNQ} value="nq"/>
					<FormControlLabel control={<Radio color="secondary" size="small" />} label={strings.drawerAll} value="all"/>
				</RadioGroup>
			} sx={{marginLeft: 0}}/>
			{
				sources[listSource].withTime ?
					<StyledFormControlLabel label={strings.drawerConsiderTime} labelPlacement="top" control={
						<Switch color="secondary" checked={considerTime.value} onChange={considerTime.handler} sx={{marginLeft: '-12px'}}/>
					} sx={{marginLeft: 0}}/>
					: null
			}
		</StyledFormControl>
		<Divider />
		<StyledFormControl>
			<Typography variant="h5" mb={2}>{strings.drawerManualUpdate}</Typography>
			<div style={{display: "flex", flexDirection: "row", justifyContent: "flex-start"}}>
				<TextField select value={world.value} onChange={world.handler} variant="outlined" label={strings.drawerDC} margin="dense" sx={{marginRight: "10px"}}>{
					worlds.map((world, i) =>
						(<MenuItem value={world} key={world}>
							{worldsName[i]}
						</MenuItem>)
					)
				}</TextField>
				<TextField select value={server.value} onChange={server.handler} variant="outlined" label={strings.drawerWorld} margin="dense">{
					servers[worlds.indexOf(world.value)].map((server, i) =>
						(<MenuItem value={server} key={server}>
							{serversName[worlds.indexOf(world.value)][i]}
						</MenuItem>)
					)
				}</TextField>
			</div>
			<TextField label={strings.drawerAverageWindowSize} value={priceWindow.value} onChange={priceWindow.handler} variant="outlined" margin="dense"/>
		</StyledFormControl>
		<Divider />
		<StyledButton variant="contained" color="primary" size="large" disabled={isLoading.value} onClick={isLoading.handler}>
			{strings.drawerUpdate}
		</StyledButton>
	</Drawer>);
}


export default SettingDrawer