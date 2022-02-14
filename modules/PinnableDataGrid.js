import {forwardRef, useMemo} from "react";
import dynamic from 'next/dynamic';
import {Box, useTheme} from "@mui/material";
import clsx from "clsx";

const DynamicDataGrid = dynamic(() =>
	import("@mui/x-data-grid").then(({DataGrid}) =>
		({forwardedRef, ...props}) => <DataGrid ref={forwardedRef} {...props}/>
	)
);
const DataGrid = forwardRef((props, ref) => <DynamicDataGrid forwardedRef={ref} {...props} />)
const addClassName = (item, key, className) => {
	switch (typeof item[key]) {
		case "string":
			item[key] = clsx(item[key], className);
			break;
		case "function":
			item[key] = (p) => clsx(item[key](p), className);
			break;
		default:
			item[key] = className
	}
	return item;
}

const PinnableDataGrid = forwardRef(({pinnedColumns: p, columns, rows, pageSize, sx, onSortModelChange, ...props}, ref) => {
	const hasLeft = !!p?.left?.length,
		hasRight = !!p?.right?.length;
	const pinnedColumns = {left: p.left ?? [], right: p.right ?? []};
	const columnsLeft = pinnedColumns.left.map(key => {
			let c = columns.find(c => c.field === key);
			addClassName(c, 'headerClassName', 'Pinnable');
			addClassName(c, 'cellClassName', 'Pinnable');
			return c;
		}),
		columnsRight = pinnedColumns.right.map(key => {
			let c = columns.find(c => c.field === key);
			addClassName(c, 'headerClassName', 'Pinnable');
			addClassName(c, 'cellClassName', 'Pinnable');
			return c;
		}),
		cuttedColumns = useMemo(() => columns.map(col =>
			(columnsLeft.some(c => c === col) || columnsRight.some(c => c === col)) ?
				{...col, renderCell: () => "", renderHeader: () => ""}
				: col), [columns, columnsLeft, columnsRight])
	const theme = useTheme();

	return (<Box sx={{
		height: '100%', width: '100%',
		position: 'relative'
	}}>
		<DataGrid {...{columns: cuttedColumns, rows, pageSize, sx, onSortModelChange, ...props}} ref={ref}/>
		{ hasLeft ? <DataGrid
			{...{columns: columnsLeft, rows, pageSize, ...props}}
			hideFooter
			disableExtendRowFullWidth
			sx={{
				position: 'absolute', top: 0, left: 0, width: '100%',
				pointerEvents: 'none',
				'& .Pinnable': {
					backgroundColor: theme.palette.background.default,
					pointerEvents: 'auto'
				},
				'& .MuiDataGrid-overlay': {
					display: 'none'
				}
			}}
		/> : null }
		{ hasRight ? <DataGrid
			{...{columns: columnsRight, rows, pageSize, ...props}}
			hideFooter
			disableExtendRowFullWidth
			sx={{
				position: 'absolute', top: 0, right: 0, width: '100%',
				pointerEvents: 'none',
				'& .Pinnable': {
					backgroundColor: theme.palette.background.default,
					pointerEvents: 'auto'
				},
				'& .MuiDataGrid-overlay': {
					display: 'none'
				},
				'& .MuiDataGrid-columnHeadersInner': {
					flexDirection: 'row-reverse'
				},
				'& .MuiDataGrid-row': {
					flexDirection: 'row-reverse'
				}
			}}
		/> : null }
	</Box>)
})



export default PinnableDataGrid;