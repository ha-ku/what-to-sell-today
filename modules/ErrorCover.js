import {StyledCircularProgress, StyledLoadingContainer} from "./styledComponents";
import useTranslate from "./useTranslate";
import {useSelector} from "react-redux";
import {reportSelectors} from "./report/reportSlice";

const ErrorCover = () => {
	const open = Boolean(useSelector(reportSelectors.error));
	const shouldRetry = useSelector(reportSelectors.shouldRetry);
	const error = useSelector(reportSelectors.error);

	const { FormattedMessage } = useTranslate('error');

	return (
		<StyledLoadingContainer open={open} sx={{zIndex: theme => theme.zIndex.drawer + 1, backgroundColor: theme => theme.palette.background.paper}}>
			<StyledCircularProgress />
			<span>
				<FormattedMessage id="msg" values={{code: error?.code}} />
			</span>
			<span>
			{shouldRetry ?
				<FormattedMessage id="retry" />
				: <FormattedMessage id="retryFail" />
			}
					</span>
		</StyledLoadingContainer>
	);
}


export default ErrorCover;