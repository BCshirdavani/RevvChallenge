import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IDonation } from "./DataHelper";



export interface ConationState {
	value: IDonation[];
}

const initialState: ConationState = {
	value: [
		{id: "",
		first_name: "",
		last_name: "",
		email: "",
		organization: "",
		amount: 0,
		created_at: new Date(),
		address: "",
		city: "",
		state: "",
		postal_code: "",
		subscription: false,
		account_type: "",
		}
	]
}

export const donationSlice = createSlice({
	name: 'donations',
	initialState,
	reducers: {
		setDonationData: (state, action: PayloadAction<IDonation[]>) => {
			state.value = action.payload;
		},
	}
});

export const { setDonationData } = donationSlice.actions;

export default donationSlice.reducer;