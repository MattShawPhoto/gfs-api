import {parse} from 'csv-parse'
import * as fs from "node:fs";
import { IDatabaseContext } from './store/fakeDbContext';
import { Consignment } from './types/consignment';

enum CsvParserError {
    InvlaidChar = "INVALID_CHAR",
    InvlaidConsignmentNumber ="INVALID_CONSIGNMENT_NUMBER"
}

const consistentColumnNames = [
    'consignmentNumber',
    'deliveryAddress',
    'weight',
    'deliveryType',
    'parcelCount',
    'shipmentDate',
    'deliveryDate',
    'status'
]

export const gfsParser = (path: string, dbContext: IDatabaseContext): void => {

    const parser = parse({
        cast: false // don't automatically try to cast input to objects, it'll end in tears
        , columns: consistentColumnNames // map csv input columns to consistent cols for storage
        , delimiter: ','
        , skipEmptyLines: true // ignore any empty skipEmptyLines
        , skipRecordsWithError: true // we want to ignore bad records
        , autoParse: false // don't automatically cast anything either
        , fromLine: 2 // skip header row
        , onRecord: (record: Consignment): Consignment | null => {
            for (const key in record) {
                if(Object.prototype.hasOwnProperty.call(record, key)) {
                    if (hasInvalidChars(record[key as keyof Consignment])) {
                        console.warn(`❌ Skipped record for reason: ${CsvParserError.InvlaidChar}, "${record.consignmentNumber}" at row index ${parser.info.lines}`)
                        return null
                    }
                }
            }

            if(new RegExp(" ", 'g').test(record.consignmentNumber)) {
                console.warn(`❌ Skipped record for reason: ${CsvParserError.InvlaidConsignmentNumber}, "${record.consignmentNumber}" at row index ${parser.info.lines}`)
             return null;
            }
            return record;
        }

    });

    // todo add extra handling here to check path is ok.

    fs.createReadStream(path)
        .pipe(parser)
        .on('data', (record: Consignment) => {
            console.log(`✔️ inserted consignment: ${record.consignmentNumber}`)
            dbContext.insert(record)
        })
        .on('skip', ({ message, code }: { message: string, code: string }) => console.log(`❌ Skipped record for reason: ${code}, ${message}`))
        .on('end', () => console.info(`Processed ${parser.info.records} records from ${parser.info.lines} lines, inserted: ${dbContext.count}`))
        .on('error', (err) => console.error('Error parsing CSV:', err.message));
}

const hasInvalidChars = (field: string | number): boolean => /;/g.test(field.toString())
