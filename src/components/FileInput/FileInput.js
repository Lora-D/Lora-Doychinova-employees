import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';

import classes from "./FileInput.module.css";

const FileInput = (props) => {

    const [uploadedFile, setUploadedFile] = useState(null);

    const fileUploadHandler = (event) => {
        setUploadedFile(event.target.files[0]);
    };

    const validateRecord = (record) => {

        let isValid = true;
        const empIdVal = parseInt(record.EmpID);
        const projIdVal = parseInt(record.ProjectID);
        if (
            //Another option to check for NaN 
            // eslint-disable-next-line
            empIdVal !== empIdVal
            || isNaN(projIdVal)
            || isNaN(record.DateFrom)
            || isNaN(record.DateTo)
        ) {
            isValid = false;
        }

        return isValid;
    }

    const prepareDate = (date, formatStr) => {
        let result;

        if (date === "NULL") {
            const temp = new Date();
            result = Date.UTC(temp.getFullYear(), temp.getMonth(), temp.getDate(), 0, 0, 0);

        } else {
            const temp = date.replace(/\D/g, '');
            const format = formatStr.split("-");
            let year, month, day = "";
            //Months are 0 based, hence the -1 
            if (format[0] === "DD" && date !== "") {
                year = temp.slice(4);
                month = temp.slice(2, 4) - 1;
                day = temp.slice(0, 2);
            } else if (format[0] === "MM" && date !== "") {
                year = temp.slice(4);
                month = temp.slice(0, 2) - 1;
                day = temp.slice(2, 4);
            } else if (format[0] === "YYYY" && date !== "") {
                year = temp.slice(0, 4);
                month = temp.slice(4, 6) - 1;
                day = temp.slice(6);
            }
            result = Date.UTC(year, month, day, 0, 0, 0)
        }
        return result;
    };

    useEffect(() => {
        if (uploadedFile) {
            if (uploadedFile.type !== 'text/csv') {
                props.setErrorState({ hasError: true, errorsCount: 0, type: "file" });
                props.clearState();
            } else {
                Papa.parse(uploadedFile, {
                    header: true, skipEmptyLines: "greedy", complete: res => {
                        const temp = [];
                        let errorsCount = 0;

                        res.data.map((el) => {
                            el.DateFrom = prepareDate(el.DateFrom, props.format);
                            el.DateTo = prepareDate(el.DateTo, props.format);
                            const recordIsValid = validateRecord(el);

                            if (recordIsValid) {
                                temp.push(el);
                            } else {
                                errorsCount++;
                                props.setErrorState({ hasError: true, errorsCount: errorsCount, type: "records" })
                            }
                        })
                        console.log(temp);
                        console.log(res.data)
                        props.setParsedCsvData(temp);

                    }
                })
            }
        }
        //This is the intended behaviour, the useEffect hook must only run when the data is ready. 
        // eslint-disable-next-line
    }, [uploadedFile]);

    return <input className={classes.input} type='file' onChange={fileUploadHandler} />
}


export default FileInput;