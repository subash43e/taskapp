"use client"
import React from "react";
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import TaskCreation from "../Components/Task_Creation/Index";


export default function Home() {
  const showTaskCreation = useSelector((state: RootState) => state.ui.showTaskCreation);

  return (
    <>
      {!showTaskCreation  ? null : <TaskCreation />}
    </>
  );
}

