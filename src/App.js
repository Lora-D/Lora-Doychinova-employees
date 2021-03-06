import React, { useState, useEffect } from 'react';

//Components:
import FileInput from './components/FileInput/FileInput';

//Styles: 
import classes from './App.module.css';



function App() {


    const [parsedCsvData, setParsedCsvData] = useState(null);
    const [selectedFormat, setSelectedFormat] = useState("YYYY-MM-DD");
    const [commonDays, setCommonDays] = useState(null);
    const [mostCommonDaysData, setMotCommonDayData] = useState(null);
    const [errors, setError] = useState({
        hasError: false,
        errorsCount: 0,
        type: "",
    });

    /**
     * Clears the previously displayed data, if any
     */
    const clearState = () => {
        setParsedCsvData(null);
        setSelectedFormat("YYYY-MM-DD");
        setCommonDays(null);
        setMotCommonDayData(null);
    }

    /**
     * Used to calculate how many days, if any, are overlapping in two time periods.
     * @param {Array} duration1 of dates in UTC format
     * @param {Array} duration2 of dates in UTC format
     * @returns the number of days which overlap for the two intervals
     */
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

    /**
     * Calculates the common days each pair of employees has on a common project. Arranges the data based on employee pairs and then project
     * @param {Object} data containing the data for employees involvment in projects 
     * @returns {Object} containing emploee pairs as properies, each associated to an object containing project ID - common days 
     */
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
        console.log(result);
        return result;
    };


    useEffect(() => {

        if (parsedCsvData !== null) {
            setCommonDays(processParsedData(parsedCsvData));
        }
        //This is the intended behaviour, the useEffect hook must only run when the data is ready. 
        // eslint-disable-next-line
    }, [parsedCsvData]);

    /**
     * 
     * @param {Object} data containing pair - projects information
     * @returns {Object} specifying the name of the pair with most days and the number of those days.
     */
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
    };

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
                <div className={classes.pairInfo}>
                    <div className={classes.pairDetailCell}>
                        {pairArr[0]}
                    </div>
                    <div className={classes.pairDetailCell}>
                        {pairArr[1]}
                    </div>
                    <div className={classes.pairDetailCell}>
                        {proj}
                    </div>
                    <div className={classes.pairDetailCell}>
                        {data[proj]}
                    </div>
                </div>
            )
        }
        return result;
    };

    const onFormatChangeHandler = (e) => {
        setSelectedFormat(e.target.value)
    };

    return (
        <div className={classes.App}>
            <div className={classes.formatTitle}>Please select the format your .CSV file uses:</div>
            <div className={classes.formatsContainer}>
                <div>
                    <label htmlFor='formatThree'>YYYY MM DD</label>
                    <input id="formatThree" type={"radio"} name="selectedFormat" value="YYYY-MM-DD" onChange={onFormatChangeHandler} checked={selectedFormat === "YYYY-MM-DD"} />
                </div>
                <div>
                    <label htmlFor='formatOne'>DD MM YYYY</label>
                    <input id="formatOne" type={"radio"} name="selectedFormat" value="DD-MM-YYYY" onChange={onFormatChangeHandler} checked={selectedFormat === "DD-MM-YYYY"} />
                </div>

                <div>
                    <label htmlFor='formatTwo'>MM DD YYYY</label>
                    <input id="formatTwo" type={"radio"} name="selectedFormat" value="MM-DD-YYYY" onChange={onFormatChangeHandler} checked={selectedFormat === "MM-DD-YYYY"} />
                </div>


            </div>

            <FileInput
                format={selectedFormat}
                setParsedCsvData={setParsedCsvData}
                setErrorState={setError}
                clearState={clearState}
            ></FileInput>

            {
                mostCommonDaysData !== null ?
                    <>
                        <div className={classes.pairDetails}> The pair with most common days is: pair {mostCommonDaysData.pair.split("-").join(", ")}, {mostCommonDaysData.days} </div>

                        <div>
                            <div className={classes.headers}>
                                <div className={classes.pairDetailCell}>Employee ID #1</div>
                                <div className={classes.pairDetailCell}>Employee ID #2</div>
                                <div className={classes.pairDetailCell}>Project ID</div>
                                <div className={classes.pairDetailCell}>Days worked</div>
                            </div>

                            {preparePairDataForDisplay(commonDays[mostCommonDaysData.pair], mostCommonDaysData.pair)}

                        </div>
                    </>

                    :
                    null
            }
            {
                errors.type === "file" ?
                    <div className={classes.error}>Please upload a .CSV file</div>
                    : null
            }
            {
                errors.type === "records" &&
                <div className={classes.error}>There are {errors.errorsCount} errors, the corresponding records were ignored. Please verify your data.</div>
            }
        </div>
    );
}

export default App;
