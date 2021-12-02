import React, { useEffect, useState } from 'react';
import './App.css';
import {
    formatDonationsData, getFakeDonationData,
    IDonation,
} from "./features/data/DataHelper";
import { setDonationData } from '../src/features/data/donationSlice';
import { useAppDispatch } from "./app/hooks";
import DonorTable from "./features/donorList/DonorTable";
import DonorChart from "./features/donorChart/DonorChart";
import axios from "axios";
import { Container } from "react-bootstrap";
import LeaderBoard from "./features/leaderBoard/LeaderBoard";

function App() {
    const [donations, setDonations] = useState<IDonation[]>([]);
    const dispatch = useAppDispatch();

    useEffect(() => {
        const data = getFakeDonationData();
        dispatch(setDonationData(data));
        setDonations(data);
        // if(process.env.REACT_APP_DONATIONS_URL) {
        //     axios.get(process.env.REACT_APP_DONATIONS_URL).then((response) => {
        //         const cleanData = formatDonationsData(response.data);
        //         dispatch(setDonationData(cleanData));
        //         setDonations(cleanData);
        //     });
        // } else {
        //     console.error("missing REACT_APP_DONATIONS_URL environent variable");
        // }
    }, []);

    return (
        <div className="App">
            <Container>
                <h1>Donatoins stuff here...</h1>
                <LeaderBoard/>
                <DonorChart/>
                <DonorTable/>
            </Container>
        </div>
    );
}

export default App;
