import {Box} from "@mui/material";
import {ArrowDownward as ArrowDownwardIcon, ArrowUpward as ArrowUpwardIcon} from "@mui/icons-material";
import {memo} from "react";


function ItemHistPerCost({value, upperBound, lowerBound, valueFormatter}) {
	return (<>
		{valueFormatter({value})}
		<Box sx={{ flexGrow: 1 }} />
		{!value || (value > (upperBound ? upperBound : Number.MAX_SAFE_INTEGER)) ?
			(<ArrowDownwardIcon color="warning" fontSize="small" />) :
			((value < (lowerBound ? lowerBound : Number.MAX_SAFE_INTEGER)) ? (<ArrowUpwardIcon color="success" fontSize="small" />) : null)
		}
	</>);
}



export default memo(ItemHistPerCost);