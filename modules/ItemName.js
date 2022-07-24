import {Box, Button, Collapse, Link, Tooltip} from "@mui/material";
import {StyledIcon, StyledIconButton} from "./styledComponents";
import {AccessTime as AccessTimeIcon} from "@mui/icons-material";
import {colord} from "colord";
import HuijiIcon from '../public/img/huijiwiki.svg';
import UniIcon from '../public/img/universalis.svg';
import useTranslate from "./useTranslate";
import {memo, useState} from "react";

const dateFormat = new Intl.DateTimeFormat('zh-CN', {month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", hour12: false});

function ItemName({id, value, enName, level, defaultLastUploadTime, lastUploadTime, withTime, onClick, primary, warning}) {

	const {t} = useTranslate('grid')
	const [openLink, setOpenLink] = useState(false);

	return (<>
		<Box sx={{flex: '0 0 auto', display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center'}} onMouseEnter={() => setOpenLink(true)} onMouseLeave={() => setOpenLink(false)} >
			<Button variant="text" sx={{textTransform: 'initial', minWidth: 0}} onClick={onClick} >
				<Box component="span" sx={{maxWidth: withTime ? '109px' : '169px', overflow: "hidden", textOverflow: "ellipsis"}}>
					{t("itemName", {
						name: value,
						enName: enName
					})}
				</Box>
			</Button>
			<Collapse in={openLink} orientation="horizontal" timeout={100} easing={{enter: 'ease-in', exit: 'ease-out'}} >
				<StyledIconButton size="small">
					<Link target="_blank" href={`https://universalis.app/market/${id}`} rel="noopener noreferrer">
						<StyledIcon render={UniIcon} fill='#86a2ff' viewBox="0 0 145.9 68.5"/>
					</Link>
				</StyledIconButton>
				<StyledIconButton size="small">
					<Link target="_blank" href={`https://ff14.huijiwiki.com/wiki/物品:${value}`} rel="noopener noreferrer">
						<StyledIcon render={HuijiIcon} fill='#aaaaaa' viewBox="0 0 135.55 61.26"/>
					</Link>
				</StyledIconButton>
			</Collapse></Box>
		{withTime ?
			t("level", {level})
			: null
		}
		<Box sx={{ flexGrow: 1 }} />
		<Tooltip title={<p>
			{t("updateAt")}<br />
			<br />
			{t("updateLocalAt")}: {dateFormat.format(defaultLastUploadTime)}<br />
			{t("updateGlobalAt")}: {dateFormat.format(lastUploadTime)}
		</p>} placement="right">
			<AccessTimeIcon sx={{
				color: colord(primary).mix(warning, Math.min(
					(new Date().getTime()-defaultLastUploadTime) / 43200000, 1
				)).toHex()
			}}/>
		</Tooltip>
	</>)
}


export default memo(ItemName)