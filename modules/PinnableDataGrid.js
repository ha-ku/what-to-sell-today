import {forwardRef, memo, useDeferredValue, useState} from "react";
import {useTheme} from '@mui/material/styles';
import clsx from "clsx";
import {StyledGridContainer} from "./styledComponents";
import {ArrowDropDown as ArrowDropDownIcon, ArrowDropUp as ArrowDropUpIcon} from "@mui/icons-material";
import {DataGrid} from "@mui/x-data-grid";

import {colord} from "colord";
import {useHotkeys} from "react-hotkeys-hook";
import useWindowSize from "./useWindowSize";
import {Box} from "@mui/material";

const newClassName = (item, name, newClass) => {
	switch (typeof item[name]) {
		case "string":
			return {[name]: clsx(item[name], newClass)};
		case "function":
			return {[name]: clsx(item[name], newClass)};
		default:
			return {[name]: newClass};
	}
}

const PinnableDataGrid = forwardRef(({pinnedColumns: p, columns, rows, sx: _sx, components: _slots, gridFooterContent, ..._props}, ref) => {
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
		pinnedColumns = columns.map(c =>
			(c.pin === 'left' || c.pin === 'right') ?
				{
					...c,
					...newClassName(c, 'headerClassName', `Pinned${c.pin.replace(c.pin[0], c.pin[0].toUpperCase())}`),
					...newClassName(c, 'cellClassName', `Pinned${c.pin.replace(c.pin[0], c.pin[0].toUpperCase())}`),
				} : c
		), initialStateLeft = {
		columns: {
			columnVisibilityModel: Object.fromEntries(
				columns.filter(c => c.pin !== 'left').map(c => [c.field, false])
			)
		},
		}, initialStateRight = {
			columns: {
				columnVisibilityModel: Object.fromEntries(
					columns.filter(c => c.pin !== 'right').map(c => [c.field, false])
				)
			},
		}, cuttedColumns = columns.map(col =>
			(col.pin === 'left' || col.pin === 'right') ?
				{
					...col,
					renderCell: () => null,
					renderHeader: () => null,
				}
				: col
		),
		rowsLeft = useDeferredValue(rows),
		rowsRight = useDeferredValue(rows);

	const theme = useTheme(),
		{height} = useWindowSize(),
		[paginationModel, setPaginationModel] = useState({
			pageSize: height ? Math.max(Math.floor((height - 226) / 52), 5) : 5,
			page: 0
		});

	useHotkeys('left', () => setPaginationModel(model => ({
		...model,
		page: Math.max(model.page - 1, 0)
	})));
	useHotkeys('right', () => setPaginationModel(model => ({
		...model,
		page: Math.min(model.page + 1, Math.ceil(rows.length / model.pageSize) - 1)
	})), [rows]);

	const props = {
		..._props, paginationModel,
		slots: {
			columnSortedAscendingIcon: ArrowDropUpIcon,
			columnSortedDescendingIcon: ArrowDropDownIcon,
			...(_slots ?? {}),
		},

		columns: pinnedColumns,
		sx: {
			..._sx,
			'& .PinnedLeft': {
				backgroundColor: theme.palette.background.default,
				pointerEvents: 'auto'
			},
			'& .PinnedRight': {
				backgroundColor: theme.palette.background.default,
				pointerEvents: 'auto'
			},
			'& .MuiDataGrid-overlay': {
				display: 'none'
			}
		},
	}

	return (
		<>
			<DataGrid autoPageSize {...{rows, onPaginationModelChange: setPaginationModel, ...props, columns: cuttedColumns, sx}} ref={ref}/>
			<StyledGridContainer defaultColor={colord(theme.palette.secondary.main).alpha(0.2).toHex()}>
				{ pinnedColumns.some(c => c.pin === 'left') ? <DataGrid
					{...{rows: rowsLeft, ...props}}
					hideFooter
					showCellVerticalBorder
					showColumnVerticalBorder
					initialState={initialStateLeft}
				/> : <Box /> }
				{ pinnedColumns.some(c => c.pin === 'right') ? <DataGrid
					{...{rows: rowsRight, ...props}}
					hideFooter
					showCellVerticalBorder
					showColumnVerticalBorder
					initialState={initialStateRight}
				/> : <Box /> }
			</StyledGridContainer>
		</>
	)
})



export default memo(PinnableDataGrid);