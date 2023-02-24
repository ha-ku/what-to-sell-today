import {forwardRef, useMemo, memo, useDeferredValue, useState} from "react";
import {useTheme} from '@mui/material/styles';
import clsx from "clsx";
import {StyledGridContainer} from "./styledComponents";
import {ArrowDropDown as ArrowDropDownIcon, ArrowDropUp as ArrowDropUpIcon} from "@mui/icons-material";
import {DataGrid} from "@mui/x-data-grid";

import {colord} from "colord";
import {useHotkeys} from "react-hotkeys-hook";
import useWindowSize from "./useWindowSize";

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

const PinnableDataGrid = forwardRef(({pinnedColumns: p, columns, rows, sx: _sx, components: _components, gridFooterContent, ..._props}, ref) => {
	//console.log('rerender PinnableDataGrid');
	const sx = {
			'& .MuiDataGrid-footerContainer': {
				justifyContent: 'flex-end !important',
					flexDirection: 'row-reverse'
			},
			'& .MuiDataGrid-columnHeaderTitleContainer .MuiIconButton-root': {
				padding: '1px'
			},
			'& .MuiDataGrid-footerContainer::before': {
				content: gridFooterContent,
			},
			..._sx
		},
		components = {
			ColumnSortedAscendingIcon: ArrowDropUpIcon,
			ColumnSortedDescendingIcon: ArrowDropDownIcon,
			..._components
		};
	const hasLeft = !!p?.left?.length,
		hasRight = !!p?.right?.length;
	const pinnedColumns = {left: p.left ?? [], right: p.right ?? []},
		baseVisibility = columns.reduce((acc, c) => {
			acc[c.field] = false;
			return acc;
		}, {});
	const [columnsLeft, columnsRight, initialStateLeft, initialSateRight, cuttedColumns] = useMemo(() => [
		columns.map(c => {
			if(pinnedColumns.left.includes(c.field)) {
				let col = {...c}
				addClassName(col, 'headerClassName', 'Pinnable');
				addClassName(col, 'cellClassName', 'Pinnable');
				return col;
			}
			return c;
		}),
		columns.map(c => {
			if(pinnedColumns.right.includes(c.field)) {
				let col = {...c}
				addClassName(c, 'headerClassName', 'Pinnable');
				addClassName(c, 'cellClassName', 'Pinnable');
				return col;
			}
			return c;
		}),{
			columns: {
				columnVisibilityModel: pinnedColumns.left.reduce((acc, key) => {
					delete acc[key]
					return acc;
				}, {...baseVisibility})
			}
		},{
			columns: {
				columnVisibilityModel: pinnedColumns.right.reduce((acc, key) => {
					delete acc[key]
					return acc;
				}, {...baseVisibility})
			}
		},
		columns.map(col =>
			(pinnedColumns.left.some(key => key === col.field) || pinnedColumns.right.some(key => key === col.field)) ?
				{...col, renderCell: () => null, renderHeader: () => null}
				: col
		),
	], [columns, p]);

	const theme = useTheme();
	const [sxLeft, sxRight] = [
		{
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
		},
		{
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
		}
	];
	const rowsLeft = useDeferredValue(rows),
		rowsRight = useDeferredValue(rows);

	const { height } = useWindowSize();
	const [pageSize, setPageSize] = useState(height ? Math.max(Math.floor((height - 226) / 52 ), 5) : 5),
		[page, setPage] = useState(0);
	useHotkeys('left', () => setPage(page => Math.max(page-1, 0)));
	useHotkeys('right', () => setPage(page => Math.min(page+1, Math.ceil(rows.length / pageSize) - 1)), [rows, pageSize]);

	const props = {
		..._props,
		components, page, setPage
	}

	return (
		<StyledGridContainer defaultColor={colord(theme.palette.secondary.main).alpha(0.2).toHex()}>
			<DataGrid autoPageSize {...{columns: cuttedColumns, rows, sx, onPageSizeChange: setPageSize, ...props}} ref={ref}/>
			{ hasLeft ? <DataGrid
				{...{columns: columnsLeft, rows: rowsLeft, pageSize, ...props}}
				hideFooter
				disableExtendRowFullWidth
				initialState={initialStateLeft}
				sx={sxLeft}
			/> : null }
			{ hasRight ? <DataGrid
				{...{columns: columnsRight, rows: rowsRight, pageSize, ...props}}
				hideFooter
				disableExtendRowFullWidth
				initialState={initialSateRight}
				sx={sxRight}
			/> : null }
		</StyledGridContainer>
	)
})

const areEqual = (p, n) => {
	if(Object.keys(p).length !== Object.keys(n).length)
		return false;
	return Object.entries(p).every(([key, pValue]) =>
		key === 'pinnedColumns' ?
			JSON.stringify(pValue) === JSON.stringify(n[key])
			: pValue === n[key]
	)
}


export default memo(PinnableDataGrid, areEqual);