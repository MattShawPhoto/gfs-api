import { Consignment } from "../types/consignment"

export interface IDatabaseContext {
    insert(consignment: Consignment): void
    findConsignmentNumber(searchStr: string ): Consignment[]
    findAddress(searchStr: string ): Consignment[]
    get count(): number
}

// In a non PoC context this should be a proper db
export class FakeDatabaseContext implements IDatabaseContext{

    private items_: Map<string, Consignment>

    constructor() {
        this.items_ = new Map<string, Consignment>();
    }

    insert(consignment: Consignment) {
         this.items_.set(consignment.consignmentNumber, consignment)
    }

    findConsignmentNumber(searchStr: string ): Consignment [] {
        const results = [];
        const pattern = new RegExp(searchStr, 'g')
        for(const [key, value] of this.items_) {
          if(pattern.test(value.consignmentNumber)) {
            let item = this.items_.get(key)
            if(item) {
              results.push(item);
            }
          }
        }
        return results
      }

      findAddress(searchStr: string ): Consignment [] {
          const results = [];
          const pattern = new RegExp(searchStr, 'g')
          for(const [key, value] of this.items_) {
            if(pattern.test(value.deliveryAddress)) {
              let item = this.items_.get(key)
              if(item) {
                results.push(item);
              }
            }
          }
          return results
        }

    get count() : number {
        return this.items_.size
    }
}
