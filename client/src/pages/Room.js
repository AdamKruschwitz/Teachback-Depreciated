import React, { useState, useEffect } from 'react'
import styled from 'styled-components'

import { StepDisplay } from '../components'
import { Button } from '@mui/material';
import remarkGFM from 'remark-gfm';
import ReactMarkdown from 'react-markdown'
import { CommentInput } from '../components';

import { useQuery, useMutation } from '@apollo/client';
import { GET_CURRENT_STEP, GET_ROOM } from '../utils/queries' ;
import { CONNECT_TO_ROOM, DISCONNECT_FROM_ROOM, FINISH_STEP, CANCEL_FINISHED_STEP } from '../utils/mutations';
import { useParams } from 'react-router-dom';

import { useGlobalContext } from '../utils/GlobalContext'

export default function Room() {
    const [state, dispatch] = useGlobalContext();
    console.log(state);
    // Will be used for displaying connected users and allowing next buttons.
    const [room, setRoom] = useState({});
    const [finishedStep, setFinishedStep] = useState(false);
    // const [curStepI, setCurStepI] = useState(0);
    const { id } = useParams();
    console.log(id);
    const { data: roomData, loading: roomLoading, error } = useQuery(GET_ROOM, { variables: { roomId: id } });
    
    
    // const { data: stepData } = useQuery(GET_CURRENT_STEP, { variables: {id: id}, pollInterval: 500 });
    // const [connectToRoom] = useMutation(CONNECT_TO_ROOM);
    // const [disconnectFromRoom] = useMutation(DISCONNECT_FROM_ROOM);
    const [finishStep] = useMutation(FINISH_STEP);
    const [cancelFinishedStep] = useMutation(CANCEL_FINISHED_STEP);
    

    // console.log("room loading: " + roomLoading);
    // console.log("room data: " + JSON.stringify(roomData, null, 2));
    console.log(room);
    console.log(state);
    console.log("room error: " + JSON.stringify(error, null, 2));

    // if(error) alert("There was an error loading the room!");

    const toggleFinishedStep = () => {
        setFinishedStep(!finishedStep);
    }

    const handleNextStep= () => {
        // TODO - Progress to the next step in the tutorial
    }

    const areAllUsersReady = () => {
        var allUsersReady = true;
        const connectedUserEmails = room.connectedUsers.map(user => user.email);
        const finishedUserEmails = room.connectedUsers.map(user => user.email);
        for(const email of connectedUserEmails) {
            if(finishedUserEmails.indexOf(email) === -1) {
                allUsersReady = false;
                break;
            }
        }
        return allUsersReady;
    }

    const handleFinishStep = () => {
        try {
            finishStep({
                variables: {
                    roomId: id
                }
            });
            toggleFinishedStep();
        } catch (error) {
            console.log(JSON.stringify(error, null, 2));
        }
    }

    const handleCancelFinishStep = () => {
        cancelFinishedStep({
            variables: {
                roomId: id
            }
        });
        toggleFinishedStep();
    }

    const handleCloseRoom = () => {
        // TODO - delete the room
    }

    const renderRoomControls = () => {
        if(room.owner.email === state.user.email) {
            // If on the last step
            if(room.currentStep === room.tutorial.steps.length-1) {
                return (<Button onClick={ handleCloseRoom }> Finish Tutorial </Button>)
            } else {
                if(areAllUsersReady()) {
                    return (<Button onClick={handleNextStep}>Next Step</Button>)
                } else {
                    return (<Button disabled>Next Step</Button>)
                }
            }
        } else {
            if(finishedStep) {
                return (<Button id="undo-finished-step" onClick={handleCancelFinishStep}>I'm not ready!</Button>)
            } else {
                return (<Button id="finish-step" onClick={handleFinishStep}>Finish Step</Button>)
            }
        }
    }
    
    // Handle loading initial room data
    useEffect( () => {
        if(roomData) {
            // If the room has loaded for the first time...
            setRoom(roomData.room);
        } 
    }, [setRoom, roomData]);

    // Handle step updates
    // useEffect( () => {
    //     if(stepData) {
    //         setRoom({
    //             ...room,
    //             currentStep: stepData.currentStep
    //         });
    //     }
    // }, [stepData]);

    // connect to the room on the server side
    // useEffect( () => {
    //     connectToRoom({
    //         variables: {
    //             roomId: id
    //         }
    //     });

    //     // Cleanup for when the user disconnects
    //     return () => {
    //         disconnectFromRoom({
    //             variables: {
    //                 roomId: id
    //             }
    //         });
    //     }
    // }, [])

    if(roomLoading || !room.tutorial) return "Room Loading..."

    return (
        <MainContainer>
            <StepDisplay content={room.tutorial.steps[room.currentStep].content}/>
            <ButtonContainer>
                {!!state.user ? renderRoomControls() : ""}
            </ButtonContainer>
            <CommentsContainer>
                <h1>Comments</h1>
                {
                    room.tutorial.steps[room.currentStep].comments.map(comment => {
                        return (
                            <CommentsCard>
                                <h3>{ comment.author.username }</h3>
                                <p>{ comment.content }</p>
                            </CommentsCard>
                        )
                    })
                }
                
            </CommentsContainer>
        </MainContainer>
    )
}

const MainContainer = styled.div`
    display: flex;
    flex-direction: column;
`


const ButtonContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    flex: 0.1;
    margin: 10px;
    font-family: Montserrat;


    > button {
        border: 1px solid #94ECBE !important;
        margin-bottom: 15px !important;
        color: var(--light-green) !important;
        border-color: var(--light-green) !important;
        margin: 10px;
        :hover {
            background-color: var(--light-green) !important;
            color: var(--dark-purple) !important;
        }
    }

    > #undo-finished-step {
        color: var(--red) !important;
        border-color: var(--red) !important;
    }
`
const CommentsContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex: 0.5;
    margin: 10px;
    font-family: Montserrat;
`
const CommentsCard = styled.div`
    font-family: Montserrat;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
    margin: 10px;

    > h3 {
        margin-left: 10px;
    }

    > p {
        margin-left: 10px;
    }
`
