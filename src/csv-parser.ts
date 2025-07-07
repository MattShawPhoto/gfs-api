import {parse} from 'csv-parse'
import * as fs from "node:fs";

export const gfsParser = (path: string): void => {
   const parser = parse({});

   // todo add extra handling here to check path is ok.

   fs.createReadStream(path)
       .pipe(parser)
}
