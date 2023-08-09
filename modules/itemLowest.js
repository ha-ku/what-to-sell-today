import {Badge, Chip, Tooltip} from "@mui/material";
import {memo} from "react";


function ItemLowest({price, quantity, seller, color}) {
	return (<Tooltip title={seller} placement="right">
			<Badge color={color} badgeContent={quantity} max={999} >
				<Chip label={price} size="small" />
			</Badge>
		</Tooltip>)
	;
}


export default memo(ItemLowest);