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

const PinnableDataGrid = forwardRef(({pinnedColumns: p, columns, rows, pageSize, onPageSizeChange, sx, onSortModelChange, ...props}, ref) => {
	const hasLeft = !!p?.left?.length,
		hasRight = !!p?.right?.length;
	const pinnedColumns = {left: p.left ?? [], right: p.right ?? []},
		baseVisibility = columns.reduce((acc, c) => {
			acc[c.field] = false;
			return acc;
		}, {});
	const columnsLeft = columns.map(c => {
			if(pinnedColumns.left.includes(c.field)) {
				let col = {...c}
				addClassName(col, 'headerClassName', 'Pinnable');
				addClassName(col, 'cellClassName', 'Pinnable');
				return col;
			}
			return c;
		}),
		columnsRight = columns.map(c => {
			if(pinnedColumns.right.includes(c.field)) {
				let col = {...c}
				addClassName(c, 'headerClassName', 'Pinnable');
				addClassName(c, 'cellClassName', 'Pinnable');
				return col;
			}
			return c;
		}),
		visibilityLeft = pinnedColumns.left.reduce((acc, key) => {
			delete acc[key]
			return acc;
		}, {...baseVisibility}),
		visibilityRight = pinnedColumns.right.reduce((acc, key) => {
			delete acc[key]
			return acc;
		}, {...baseVisibility}),
		cuttedColumns = useMemo(() => columns.map(col =>
			(pinnedColumns.left.some(key => key === col.field) || pinnedColumns.right.some(key => key === col.field)) ?
				{...col, renderCell: () => "", renderHeader: () => ""}
				: col), [columns, pinnedColumns])
	const theme = useTheme();


	return (<Box sx={{
		height: '100%', width: '100%',
		position: 'relative'
	}}>
		<DataGrid autoPageSize {...{columns: cuttedColumns, rows, sx, onSortModelChange, onPageSizeChange, ...props}} ref={ref}/>
		{ hasLeft ? <DataGrid
			{...{columns: columnsLeft, rows, pageSize, ...props}}
			hideFooter
			disableExtendRowFullWidth
			initialState={{
				columns: {
					columnVisibilityModel: visibilityLeft
				}
			}}
			sx={{
				...sx,
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
			initialState={{
				columns: {
					columnVisibilityModel: visibilityRight
				}
			}}
			sx={{
				...sx,
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