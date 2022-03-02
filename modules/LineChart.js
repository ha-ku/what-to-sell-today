import styled from '@emotion/styled'
import {useMemo} from "react";
import useSvgDefs from "./useSvgDefs";



const Root = styled(({color, ...props}) => (<svg {...props} />))`
	color: ${({color}) => color} ;
`;

const LineChart = function({width, height, data, color, darkMode}) {
	const offset = height / 3;
	useSvgDefs('verticalBlur', () => (
		<filter id="verticalBlur">
			<feGaussianBlur stdDeviation={`0,${(offset * 0.75).toFixed(2)}`}/>
		</filter>
	));
	const id = data.map(point => point.join(',')).join('_');
	const [area, clip] = useMemo(() => {
		const maxY = Math.max(...(data.map(([_,y]) => y)));
		const maxX = Math.max(...(data.map(([x,_]) => x)));
		const scaleX = (x, offset = 0) => (x / maxX * width + offset).toFixed(2);
		const scaleY = (y, offset = 0) => (y / maxY * height + offset).toFixed(2);
		const generateD = (data, offset = 0) => {
			return data.map((point, i) =>
				i === 0 ? `L ${scaleX((point[0]+data[i+1][0]) / 2)} ${scaleY((point[1] + data[i+1][1]) / 2, offset)}`
					: (i === data.length - 1 ? `L ${scaleX(point[0])} ${scaleY(point[1], offset)}`
							: (i === 1 ? `Q ${scaleX(point[0])} ${scaleY(point[1], offset)} ` +
									`${scaleX((point[0]+data[i+1][0]) / 2)} ${scaleY((point[1] + data[i+1][1]) / 2, offset)}`
									: `T ${scaleX((point[0]+data[i+1][0]) / 2)} ${scaleY((point[1] + data[i+1][1]) / 2, offset)}`
							)
					)
			).join(' ');
		}
		return maxY === 0 ?
			[`M 0 0 L ${width} 0 L 0 0 Z`, null]
			: [
				`M ${scaleX(data[0][0],  - offset)} ${scaleY(data[0][1], - offset)} \
				L ${scaleX(data[0][0])} ${scaleY(data[0][1], - offset)} \
				${generateD(data, - offset)} \
				L ${scaleX(data[data.length-1][0])} ${scaleY(data[data.length-1][1], - offset)} \
				L ${scaleX(data[data.length-1][0], offset)} ${scaleY(data[data.length-1][1], - offset)} \
				L ${scaleX(data[data.length-1][0], offset)} ${scaleY(data[data.length-1][1], offset)} \
				L ${scaleX(data[data.length-1][0])} ${scaleY(data[data.length-1][1], offset)} \
				${generateD([...data].reverse(), offset)} \
				L ${scaleX(data[0][0])} ${scaleY(data[0][1], offset)} \
				L ${scaleX(data[0][0], -offset)} ${scaleY(data[0][1], offset)} Z`,
				`M ${scaleX(data[0][0])} ${scaleY(data[0][1])} \
				${generateD(data)} \
				L ${width} 0 L 0 0 Z`];
	}, [data, width, height])

	return (
		<Root transform="scale(1, -1)" viewBox={`0 0 ${width} ${height}`} {...{width, height, color}}>
			<defs>
				<clipPath id={`clip-${id}`}>
					<path d={clip} />
				</clipPath>
			</defs>
			<path d={area} strokeWidth={0} fill="currentcolor" fillOpacity={darkMode ? 0.2 : 0.2} filter="url(#verticalBlur)" clipPath={`url(#clip-${id})`}/>
		</Root>
	);
}



export default LineChart