import {Badge, Chip, Tooltip} from "@mui/material";
import {memo} from "react";


function ItemLowest({price, quantity, seller}) {
	return (<Tooltip title={seller} placement="right">
			<Badge color="primary" badgeContent={quantity} max={999} >
				<Chip label={price} size="small" />
			</Badge>
		</Tooltip>)
	;
}


export default memo(ItemLowest);