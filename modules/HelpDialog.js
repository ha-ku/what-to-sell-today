import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Link from '@mui/material/Link';
import Typography from "@mui/material/Typography";

function HelpDialog(props) {
	return (
		<Dialog {...props}>
			<DialogTitle>这是什么？</DialogTitle>
			<DialogContent>
				<Typography variant="body1">
					<Typography variant="body1" sx={{fontWeight:"bold"}} component="span">今天带点什么</Typography>
					（下称何带）最初是为了解决派雇员探险时不知道带什么的问题，
					现已拓展到神典石、宝图等一切本质是“资源兑换商品”的选择问题。
				</Typography>
				<Typography variant="body1">
					何带从
					<Link href="https://www.universalis.app" target="_blank" rel="noopener noreferrer" underline="hover"> universalis.app </Link>
					（下称uni）查询物品列表的市场信息，并进行简单的计算后提供给用户以自行选择。
					因uni的数据最终来源于玩家的游戏内查询，数据更新仍会有一定延迟，因此也希望有更多人一起为uni提交数据。访问
					<Link href="https://bbs.nga.cn/read.php?tid=22462774&rand=476" target="_blank" rel="noopener noreferrer" underline="hover"> 此nga帖子 </Link>
					了解更多uni事宜。
				</Typography>
				<Typography variant="body1">
					如有增加其他列表的需求，可向开发者反馈（什么你不知道开发者是谁？那你是什么东西？）。
					如何带故障无法使用，也可向开发者反馈（问就是我在调试）。
					何带使用google recaptcha保护自身。</Typography>
			</DialogContent>
		</Dialog>)
}


export default HelpDialog;