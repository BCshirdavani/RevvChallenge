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
import { Container, Spinner } from "react-bootstrap";
import LeaderBoard from "./features/leaderBoard/LeaderBoard";

function App(): JSX.Element {
    const [donations, setDonations] = useState<IDonation[]>([]);
    const [showSpinner, setShowSpinner] = useState<boolean>(true);
    const dispatch = useAppDispatch();

    useEffect(() => {
        setShowSpinner(true);
        const useFakeData = process.env.REACT_APP_USE_FAKE_DATA;
        if(useFakeData === 'true'){
            const data = getFakeDonationData();
            dispatch(setDonationData(data));
            setDonations(data);
            setShowSpinner(false);
        } else {
            if(process.env.REACT_APP_DONATIONS_URL) {
                axios.get(process.env.REACT_APP_DONATIONS_URL).then((response) => {
                    const cleanData = formatDonationsData(response.data);
                    dispatch(setDonationData(cleanData));
                    setDonations(cleanData);
                    setShowSpinner(false);
                });
            } else {
                setShowSpinner(false);
                console.error("missing REACT_APP_DONATIONS_URL environent variable");
            }
        }
    }, []);

    const renderSpinner = () => {
        if(showSpinner){
            return (
                <Spinner animation={'border'}/>
            )
        } else {
            return null;
        }
    }

    return (
        <div className="App">
            <Container>
                <h1 className={"MainHeader"}>Donatoins Dashboard</h1>
                {renderSpinner()}
                <LeaderBoard/>
                <DonorChart/>
                <DonorTable/>
            </Container>
        </div>
    );
}

export default App;
