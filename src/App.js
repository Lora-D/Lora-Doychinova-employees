import React, { useState, useEffect } from 'react';

//Components:
import FileInput from './components/FileInput/FileInput';

//Styles: 
import './App.css';



function App() {


    const [parsedCsvData, setParsedCsvData] = useState(null);
    const [selectedFormat, setSelectedFormat] = useState("") //TODO: Add the selected format option. 
    const [commonDays, setCommonDays] = useState(null);
    const [mostCommonDaysData, setMotCommonDayData] = useState(null);
    const [errors, setError] = useState({
        hasError: false,
        errorsCount: 0,
        type: "",
    })



    const calculateCommonDays = (duration1, duration2) => {
        let result = 0; // No days overlapping. 

        const d1start = duration1[0];
        const d1end = duration1[1];

        const d2start = duration2[0];
        const d2end = duration2[1];

        if (d1start <= d2end && d2start <= d1end) {
            const overlapStart = d1start >= d2start ? d1start : d2start;
            const overlapEnd = d1end <= d2end ? d1end : d2end;
            const milisecondsInDay = 1000 * 60 * 60 * 24;
            result = (overlapEnd - overlapStart) / milisecondsInDay;
        }

        return result;
    };

    const processParsedData = (data) => {

        const result = {};

        for (let current = 0, i = 1; i < data.length; i++) {
            if (data[current].ProjectID === data[i].ProjectID && data[current].EmpID !== data[i].EmpID) {
                //To make this a bit more readable: 
                const emp1Id = data[current].EmpID;
                const emp2Id = data[i].EmpID;

                if (result[`${emp1Id}-${emp2Id}`]) {
                    result[`${emp1Id}-${emp2Id}`][data[current].ProjectID] = result[`${emp1Id}-${emp2Id}`][data[current].ProjectID]
                        ?
                        result[`${emp1Id}-${emp2Id}`][data[current].ProjectID] += calculateCommonDays([data[current].DateFrom, data[current].DateTo], [data[i].DateFrom, data[i].DateTo])
                        :
                        calculateCommonDays([data[current].DateFrom, data[current].DateTo], [data[i].DateFrom, data[i].DateTo])

                } else if (result[`${emp2Id}-${emp1Id}`]) {
                    result[`${emp2Id}-${emp1Id}`][data[current].ProjectID] = result[`${emp2Id}-${emp1Id}`][data[current].ProjectID]
                        ?
                        result[`${emp2Id}-${emp1Id}`][data[current].ProjectID] += calculateCommonDays([data[current].DateFrom, data[current].DateTo], [data[i].DateFrom, data[i].DateTo])
                        :
                        calculateCommonDays([data[current].DateFrom, data[current].DateTo], [data[i].DateFrom, data[i].DateTo]);

                } else {
                    result[`${emp1Id}-${emp2Id}`] = {};
                    result[`${emp1Id}-${emp2Id}`][data[current].ProjectID] = calculateCommonDays([data[current].DateFrom, data[current].DateTo], [data[i].DateFrom, data[i].DateTo]);
                }
            }
            if (i === data.length - 1 && current < data.length - 1) {
                current++;
                i = current; //No need to increment i, it will be done when the loop starts again. 
            }
        }
        return result;
    }


    useEffect(() => {

        if (parsedCsvData !== null) {
            setCommonDays(processParsedData(parsedCsvData));
        }
        //This is the intended behaviour, the useEffect hook must only run when the data is ready. 
        // eslint-disable-next-line
    }, [parsedCsvData]);


    const calculateMostCommonDays = (data) => {

        let pairWithMaxDays = "none";
        let maxPairDays = 0;

        for (let pair in data) {
            let currentPair = pair;
            let pairDays = 0;

            for (let pairProj in data[pair]) {
                pairDays += data[pair][pairProj];
            }

            if (pairDays > maxPairDays) {
                maxPairDays = pairDays;
                pairWithMaxDays = currentPair;
            }

        }
        return { pair: pairWithMaxDays, days: maxPairDays };
    }

    useEffect(() => {
        if (commonDays !== null) {
            setMotCommonDayData(calculateMostCommonDays(commonDays));
        }

        //This is the intended behaviour, the useEffect hook must only run when the data is ready. 
        // eslint-disable-next-line
    }, [commonDays])

    const preparePairDataForDisplay = (data, pairName) => {
        const result = []
        const pairArr = pairName.split("-");
        for (let proj in data) {
            result.push(
                <div>
                    <div>
                        {pairArr[0]}
                    </div>
                    <div>
                        {pairArr[1]}
                    </div>
                    <div>
                        {proj}
                    </div>
                    <div>
                        {data[proj]}
                    </div>
                </div>
            )
        }
        return result;
    }

    return (
        <div className="App">

            <FileInput setParsedCsvData={setParsedCsvData} setErrorState={setError} ></FileInput>

            {
                mostCommonDaysData !== null ?
                    <>
                        <div> The pair with most common days is: pair {mostCommonDaysData.pair.split("-").join(", ")}, {mostCommonDaysData.days} </div>
                        {
                            errors.type === "records" &&
                            <div>There are {errors.errorsCount} errors, the corresponding records were ignored. Please verify your data.</div>
                        }
                        <div>
                            <div >
                                <div>Employee ID #1</div>
                                <div>Employee ID #2</div>
                                <div>Project ID</div>
                                <div>Days worked</div>
                            </div>

                            {preparePairDataForDisplay(commonDays[mostCommonDaysData.pair], mostCommonDaysData.pair)}

                        </div>
                    </>

                    :
                    null
            }
            {
                errors.type === "file" ?
                    <div>Please upload a .CSV file</div>
                    : null
            }
        </div>
    );
}

export default App;
