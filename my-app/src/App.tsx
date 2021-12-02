import React, { useEffect, useState } from 'react';
import './App.css';
import {
    formatDonationsData,
    IDonation,
} from "./features/data/DataHelper";
import { setDonationData } from '../src/features/data/donationSlice';
import { useAppDispatch } from "./app/hooks";
import axios from "axios";
import DonorTable from "./features/donorList/DonorTable";

function App() {
    const [donations, setDonations] = useState<IDonation[]>([]);
    const dispatch = useAppDispatch();

    useEffect(() => {
        // const data = getFakeDonationData();
        if(process.env.REACT_APP_DONATIONS_URL) {
            axios.get(process.env.REACT_APP_DONATIONS_URL).then((response) => {
                const cleanData = formatDonationsData(response.data);
                dispatch(setDonationData(cleanData));
                setDonations(cleanData);
            });
        } else {
            console.error("missing REACT_APP_DONATIONS_URL environent variable");
        }
    }, []);

    return (
        <div className="App">
            <h1>Donatoins stuff here...</h1>
            <DonorTable/>
        </div>
    );
}

export default App;
