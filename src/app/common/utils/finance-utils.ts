


export class FinanceUtil {
  
    constructor() {
   
    }


    PMT(rate_per_period, number_of_payments, present_value, future_value, type){
        if(rate_per_period != 0.0){
            // Interest rate exists
            var q = Math.pow(1 + rate_per_period, number_of_payments);
            return -(rate_per_period * (future_value + (q * present_value))) / ((-1 + q) * (1 + rate_per_period * (type)));
    
        } else if(number_of_payments != 0.0){
            // No interest rate, but number of payments exists
            return -(future_value + present_value) / number_of_payments;
        }
    
        return 0;
    }

    // PMT(rate: number, nper: number, pv: number, fv: number, type: number) {
	// 	if (!fv) fv = 0;
	// 	if (!type) type = 0;

	// 	if (rate == 0) return -(pv + fv)/nper;
		
	// 	var pvif = Math.pow(1 + rate, nper);
	// 	var pmt = rate / (pvif - 1) * -(pv * pvif + fv);

	// 	if (type == 1) {
	// 		pmt /= (1 + rate);
	// 	};

	// 	return pmt;
    // }
    
    // Parameters are rate, total number of periods, payment made each period and future value
    PV(rate, nper, pmt, fv) {
        rate = parseFloat(rate);
        nper = parseFloat(nper);
        pmt = parseFloat(pmt);
        fv = parseFloat(fv);

        let pv_value;
        if ( rate == 0 ) { // Interest rate is 0
            pv_value = -(fv + (pmt * nper));
        } else {
            let x = Math.pow(1 + rate, -nper); 
            let y = Math.pow(1 + rate, nper);
            pv_value = - ( x * ( fv * rate - pmt + y * pmt )) / rate;
        }

        return pv_value;
  }

  FV(rate, nper, pmt, pv) {
        rate = parseFloat(rate);
        nper = parseFloat(nper);
        pmt = parseFloat(pmt);
        pv = parseFloat(pv);
        let fv_value;
        if ( rate == 0 ) { // Interest rate is 0
                fv_value = -(pv + (pmt * nper));
        } else {
            let x = Math.pow(1 + rate, nper);
            fv_value = - ( -pmt + x * pmt + rate * x * pv ) /rate;
        }
        return fv_value;
  }

  NPER(rate, payment, present, future, type?) {
    // Initialize type
    let newType = type || 0;
  
    // Initialize future value
    let newFuture = future || 0;
  
    // Evaluate rate and periods (TODO: replace with secure expression evaluator)
    rate = eval(rate);
  
    // Return number of periods
    let num = payment * (1 + rate * newType) - newFuture * rate;
    let den = (present * rate + payment * (1 + rate * newType));
    if (den == 0) den = 1
    return Math.log(num / den ) / Math.log(1 + rate);
  }
}