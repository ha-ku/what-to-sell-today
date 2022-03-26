import {StyledButton, StyledFormControl, StyledFormControlLabel} from "./styledComponents";
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from "@mui/material/Typography";

import {servers, serversName, worlds, worldsName} from "./worldsAndServers";


function SettingDrawer({open, userDarkMode, quality, considerTime, world, server, priceWindow, isLoading, sources, listSource}) {

	return (<Drawer anchor="left" open={open.value} onClose={open.handler} autoWidth>
		<StyledFormControl>
			<Typography variant="h5" mb={2}>外观</Typography>
			<StyledFormControlLabel label="主题" labelPlacement="top" control={
				<RadioGroup value={userDarkMode.value} onChange={userDarkMode.handler} row>
					<FormControlLabel control={<Radio color="secondary" size="small" />} label="日间" value="light"/>
					<FormControlLabel control={<Radio color="secondary" size="small" />} label="夜间" value="dark"/>
					<FormControlLabel control={<Radio color="secondary" size="small" />} label="自动" value="auto"/>
				</RadioGroup>
			} sx={{marginLeft: 0}}/>
		</StyledFormControl>
		<Divider />
		<StyledFormControl>
			<Typography variant="h5" mb={2}>即时更新</Typography>
			<StyledFormControlLabel label="品质" labelPlacement="top" control={
				<RadioGroup value={quality.value} onChange={quality.handler} row>
					<FormControlLabel control={<Radio color="secondary" size="small" />} label="HQ" value="hq"/>
					<FormControlLabel control={<Radio color="secondary" size="small" />} label="NQ" value="nq"/>
					<FormControlLabel control={<Radio color="secondary" size="small" />} label="所有" value="all"/>
				</RadioGroup>
			} sx={{marginLeft: 0}}/>
			{
				sources[listSource].withTime ?
					<StyledFormControlLabel label="计算探险时间成本" labelPlacement="top" control={
						<Switch color="secondary" checked={considerTime.value} onChange={considerTime.handler} sx={{marginLeft: '-12px'}}/>
					} sx={{marginLeft: 0}}/>
					: null
			}
		</StyledFormControl>
		<Divider />
		<StyledFormControl>
			<Typography variant="h5" mb={2}>手动更新</Typography>
			<div style={{display: "flex", flexDirection: "row", justifyContent: "flex-start"}}>
				<TextField select value={world.value} onChange={world.handler} variant="outlined" label="所在大区" margin="dense" sx={{marginRight: "10px"}}>{
					worlds.map((world, i) =>
						(<MenuItem value={world} key={world}>
							{worldsName[i]}
						</MenuItem>)
					)
				}</TextField>
				<TextField select value={server.value} onChange={server.handler} variant="outlined" label="所在服务器" margin="dense">{
					servers[worlds.indexOf(world.value)].map((server, i) =>
						(<MenuItem value={server} key={server}>
							{serversName[worlds.indexOf(world.value)][i]}
						</MenuItem>)
					)
				}</TextField>
			</div>
			<TextField label="平均窗口大小" value={priceWindow.value} onChange={priceWindow.handler} variant="outlined" margin="dense"/>
		</StyledFormControl>
		<Divider />
		<StyledButton variant="contained" color="primary" size="large" disabled={isLoading.value} onClick={isLoading.handler}>
			更新
		</StyledButton>
	</Drawer>);
}


export default SettingDrawer