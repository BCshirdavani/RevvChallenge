import React, { useEffect, useState } from 'react';
import './App.css';
import {
    formatDonationsData, getFakeDonationData,
    IDonation,
} from "./features/data/DataHelper";
import { setDonationData } from './features/data/donationSlice';
import { useAppDispatch } from "./app/hooks";
import DonorTable from "./features/donorList/DonorTable";
import DonorChart from "./features/donorChart/DonorChart";
import axios from "axios";
import { Alert, Container, Spinner } from "react-bootstrap";
import LeaderBoard from "./features/leaderBoard/LeaderBoard";

function App(): JSX.Element {
    const [showSpinner, setShowSpinner] = useState<boolean>(true);
    const [showError, setShowError] = useState<boolean>(false);
    const dispatch = useAppDispatch();

    useEffect(() => {
        setShowSpinner(true);
        const useFakeData = process.env.REACT_APP_USE_FAKE_DATA;
        if(useFakeData === 'true'){
            const data: IDonation[] = getFakeDonationData();
            dispatch(setDonationData(data));
            setShowSpinner(false);
        } else {
            if(process.env.REACT_APP_DONATIONS_URL) {
                axios.get(process.env.REACT_APP_DONATIONS_URL).then((response) => {
                    const cleanData: IDonation[] = formatDonationsData(response.data);
                    dispatch(setDonationData(cleanData));
                    setShowSpinner(false);
                }).catch((error) => {
                    setShowError(true);
                    console.error(error);
                    alert("please disable ad blockers so this site can request external data");
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

    const renderAlert = () => {
        if(showError){
            return (
                <Alert variant="danger" onClose={() => setShowError(false)} dismissible>
                    <Alert.Heading>Error!</Alert.Heading>
                    <p>
                        Please disable any ad blockers, and refresh the page.
                    </p>
                </Alert>
            );
        }
    }

    return (
        <div className="App">
            <Container>
                <h1 className={"MainHeader"}>Donatoins Dashboard</h1>
                {renderSpinner()}
                {renderAlert()}
                <LeaderBoard/>
                <DonorChart/>
                <DonorTable/>
            </Container>
        </div>
    );
}

export default App;
