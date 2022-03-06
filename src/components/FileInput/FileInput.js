import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';

const FileInput = (props) => {
    //TODO: Add a clear button for the file
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

    //TODO: Add functionality for all date formats: 
    const prepareDate = (data) => {
        let result;
        if (data === "NULL") {
            const temp = new Date();
            result = Date.UTC(temp.getFullYear(), temp.getMonth(), temp.getDate(), 0, 0, 0);
            console.log(result);
        } else {
            const temp = data.split("-");
            result = Date.UTC(temp[0], temp[1] - 1, temp[2], 0, 0, 0); //Months are 0 based, hence the -1 
            console.log(result);
        }


        return result
    }

    useEffect(() => {
        if (uploadedFile) {
            console.log(uploadedFile)
            if (uploadedFile.type !== 'text/csv') {
                props.setErrorState({ hasError: true, errorsCount: 0, type: "file" });
            } else {
                Papa.parse(uploadedFile, {
                    header: true, skipEmptyLines: "greedy", complete: res => {
                        console.log(res.data);
                        const temp = [];
                        let errorsCount = 0;

                        res.data.map((el) => {
                            el.DateFrom = prepareDate(el.DateFrom);
                            el.DateTo = prepareDate(el.DateTo);
                            const recordIsValid = validateRecord(el);

                            if (recordIsValid) {
                                temp.push(el);
                            } else {
                                errorsCount++;
                                props.setErrorState({ hasError: true, errorsCount: errorsCount, type: "records" })
                            }
                        })
                        props.setParsedCsvData(temp);

                    }
                })
            }
        }
        //This is the intended behaviour, the useEffect hook must only run when the data is ready. 
        // eslint-disable-next-line
    }, [uploadedFile]);

    return <input type='file' onChange={fileUploadHandler} />
}


export default FileInput;