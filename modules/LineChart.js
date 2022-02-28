import styled from '@emotion/styled'
import {useMemo} from "react";



const Root = styled(({color, ...props}) => (<svg {...props} />))`
	color: ${({color}) => color} ;
`;

const LineChart = function({width, height, data, color, darkMode}) {
	const area = useMemo(() => {
		const maxY = Math.max(...(data.map(([_,y]) => y)));
		const maxX = Math.max(...(data.map(([x,_]) => x)));
		const scaleX = x => (x / maxX * width).toFixed(2);
		const scaleY = y => (y / maxY * height).toFixed(2);
		const path = maxY === 0 ?'M 0 0' : data.map((point, i) =>
			i === 0 ? `M ${scaleX(point[0])} ${scaleY(point[1])}`
				: (i === data.length - 1 ? `L ${scaleX(point[0])} ${scaleY(point[1])}`
					: (i === 1 ? `Q ${scaleX(point[0])} ${scaleY(point[1])} ${scaleX((point[0]+data[i+1][0]) / 2)} ${scaleY((point[1] + data[i+1][1]) / 2)}`
						: `T ${scaleX((point[0]+data[i+1][0]) / 2)} ${scaleY((point[1] + data[i+1][1]) / 2)}`
					)
				)
			//`${i === 0 ? 'M' : 'L'} ${point[0] / maxX * width} ${point[1] / maxY * height}`
		).join(' ');
		return path + ` L ${width} 0 L 0 0 Z`;
	}, [data, width, height])

	return (
		<Root transform="scale(1, -1)" viewBox={`0 0 ${width} ${height}`} {...{width, height, color}}>
			<path d={area} strokeWidth={0} fill="currentcolor" fillOpacity={darkMode ? 0.2 : 0.4} />
		</Root>
	);
}



export default LineChart