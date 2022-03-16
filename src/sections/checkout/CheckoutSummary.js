import PropTypes from 'prop-types';
// @mui
import {
	Box,
	Card,
	Stack,
	Button,
	Divider,
	TextField,
	CardHeader,
	Typography,
	CardContent,
	InputAdornment,
} from '@mui/material';
// utils
import { fCurrency } from '../../utils/formatNumber';
// components
import Iconify from '../../components/Iconify';

// ----------------------------------------------------------------------

CheckoutSummary.propTypes = {
	total: PropTypes.number,
	discount: PropTypes.number,
	subtotal: PropTypes.number,
	onEdit: PropTypes.func,
	enableEdit: PropTypes.bool,
	onApplyDiscount: PropTypes.func,
	enableDiscount: PropTypes.bool,
};

export default function CheckoutSummary({
	total,
	onEdit,
	discount,
	subtotal,
	// onApplyDiscount,
	enableEdit = false,
	enableDiscount = false,
}) {
	return (
		<Card sx={{ mb: 3 }}>
			<CardHeader
				title="Order Summary"
				action={
					enableEdit && (
						<Button size="small" onClick={onEdit} startIcon={<Iconify icon={'eva:edit-fill'} />}>
							Edit
						</Button>
					)
				}
			/>

			<CardContent>
				<Stack spacing={2}>
					<Stack direction="row" justifyContent="space-between">
						<Typography variant="body2" sx={{ color: 'text.secondary' }}>
							Sub Total
						</Typography>
						<Typography variant="subtitle2">{fCurrency(subtotal)}</Typography>
					</Stack>

					<Stack direction="row" justifyContent="space-between">
						<Typography variant="body2" sx={{ color: 'text.secondary' }}>
							Discount
						</Typography>
						<Typography variant="subtitle2">
							{discount ? fCurrency(-discount) : fCurrency(0)}
						</Typography>
					</Stack>

					<Divider />

					<Stack direction="row" justifyContent="space-between">
						<Typography variant="subtitle1">Total</Typography>
						<Box sx={{ textAlign: 'right' }}>
							<Typography variant="subtitle1" sx={{ color: 'error.main' }}>
								{fCurrency(total)}
							</Typography>
						</Box>
					</Stack>

					{enableDiscount && (
						<TextField
							fullWidth
							placeholder="Discount codes / Gifts"
							defaultValue=""
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">
										<Button sx={{ mr: -0.5 }}>Apply</Button>
									</InputAdornment>
								),
							}}
						/>
					)}
				</Stack>
			</CardContent>
		</Card>
	);
}
