import {Box} from "@mui/material";
import LineChart from "./LineChart";
import {StyledCellContainer, StyledCellSub} from "./styledComponents";
import {memo} from "react";


function ItemVolumns({value, height, color, darkMode}) {
	return (<>
		<Box sx={{
			position: 'relative',
			alignSelf: 'flex-start'
		}}>
			<Box sx={{
				position: 'absolute',
				left: -10,
				top: 0
			}}>
				<LineChart {...{ height, width: 150, color, darkMode}} data={value.map((v, i) => [i, v])}/>
			</Box>
		</Box>
		<StyledCellContainer>
			{[1, 3, 7].map(vI =>
				(<StyledCellSub key={vI}>
					{value[vI-1]}
				</StyledCellSub>)
			)}
		</StyledCellContainer>
	</>);
}


export default memo(ItemVolumns)