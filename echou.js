// import Big from './big.js-6.2.2/big.js';

function decimalToFraction(decimal) {
    const [integerPart, fractionalPart] = decimal.toString().split('.').map(
        i => {return Big(i)}
    );
    if (!fractionalPart) return `${decimal}/1`;

    const denominator = new Big(10).pow(fractionalPart.toString().length);
    const numerator = integerPart.times(denominator).plus(fractionalPart);

    return `${numerator}/${denominator}`;
}

function simplifyFraction(fraction) {
    const [numerator, denominator] = fraction.split('/').map(
        i => {return Big(i)}
    );

    function gcd(a, b) {
        return b.eq(0) ? a : gcd(b, a.mod(b));
    }

    const greatestCommonDivisor = Big(gcd(numerator.abs(), denominator.abs()));
    const simplifiedNumerator = numerator.div(greatestCommonDivisor);
    const simplifiedDenominator = denominator.div(greatestCommonDivisor);

    return `${simplifiedNumerator}/${simplifiedDenominator}`;
}

function multiplyFractions(frac1, frac2) {
    const [numerator1, denominator1] = frac1.split('/').map(i => {return Big(i)});
    const [numerator2, denominator2] = frac2.split('/').map(i => {return Big(i)});
    const numerator = numerator1.times(numerator2);
    const denominator = denominator1.times(denominator2);

    return `${numerator}/${denominator}`;
}

function divideFractions(frac1, frac2) {
    const [numerator1, denominator1] = frac1.split('/').map(i => {return Big(i)});
    const [numerator2, denominator2] = frac2.split('/').map(i => {return Big(i)});
    const numerator = numerator1.times(denominator2);
    const denominator = denominator1.times(numerator2);

    return `${numerator}/${denominator}`;
}

function addFractions(frac1, frac2) {
    const [numerator1, denominator1] = frac1.split('/').map(i => {return Big(i)});
    const [numerator2, denominator2] = frac2.split('/').map(i => {return Big(i)});
    const commonDenominator = denominator1.times(denominator2);
    const newNumerator1 = numerator1.times(denominator2);
    const newNumerator2 = numerator2.times(denominator1);
    const numerator = newNumerator1.plus(newNumerator2);

    return `${numerator}/${commonDenominator}`;
}

function subtractFractions(frac1, frac2) {
    const [numerator1, denominator1] = frac1.split('/').map(i => {return Big(i)});
    const [numerator2, denominator2] = frac2.split('/').map(i => {return Big(i)});
    const commonDenominator = denominator1.times(denominator2);
    const newNumerator1 = numerator1.times(denominator2);
    const newNumerator2 = numerator2.times(denominator1);
    const numerator = newNumerator1.minus(newNumerator2);

    return `${numerator}/${commonDenominator}`;
}

function invertMatrix(matrix) {
    const size = matrix.length;
    let fractionsMatrix = matrix.map(row => row.map(decimalToFraction));

    // 初始化单位矩阵
    let identityMatrix = Array.from({ length: size }, (_, i) => {
        return Array.from({ length: size }, (_, j) => (i === j ? "1/1" : "0/1"));
    });

    for (let i = 0; i < size; i++) {
        // 获取对角线元素并将其化为1
        let diagElement = fractionsMatrix[i][i];
        for (let j = 0; j < size; j++) {
            fractionsMatrix[i][j] = divideFractions(fractionsMatrix[i][j], diagElement);
            identityMatrix[i][j] = divideFractions(identityMatrix[i][j], diagElement);
        }

        // 将其他行的对应列归零
        for (let k = 0; k < size; k++) {
            if (k === i) continue;
            let factor = fractionsMatrix[k][i];
            for (let j = 0; j < size; j++) {
                fractionsMatrix[k][j] = subtractFractions(
                    fractionsMatrix[k][j],
                    multiplyFractions(factor, fractionsMatrix[i][j])
                );
                identityMatrix[k][j] = subtractFractions(
                    identityMatrix[k][j],
                    multiplyFractions(factor, identityMatrix[i][j])
                );
            }
        }
    }
    return identityMatrix;
}

function calculateCoefficients(xValues, yValues) {
    const n = xValues.length;
    if (n !== yValues.length) {
        throw new Error("xValues and yValues must have the same length.");
    }

    const X = xValues.map(x => {
        // 如果pow(i)，就是范德蒙方阵
        // return Array.from({ length: n }, (_, i) => Big(x).pow(i));
        return Array.from({ length: n }, (_, i) => Big(x).pow(i + 1));
    });
    const Y = yValues.map(y => {return decimalToFraction(y)})
    const XInverse = invertMatrix(X);
    const beta = multiplyMatrixVector(XInverse, Y)

    return beta;
}

function multiplyMatrixVector(XInverse, Y) {
    const n = XInverse.length;
    let result = new Array(n).fill("0/1");

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            result[i] = simplifyFraction(
                addFractions(result[i], multiplyFractions(XInverse[i][j], Y[j]))
            );
        }
    }
    return result;
}

function equationBuilder(coefficients) {
    let terms = coefficients.map((coefficient, index) => {
        const [a, b] = coefficient.split('/').map(i => {return Big(i)});
        if (index == 0) {
            return a.gt(0) ?
        `\\frac{${a.abs()}}{${b}} x` : `-\\frac{${a.abs()}}{${b}} x`
        }
        // if (index == 1) {
        //     return a.gt(0) ?
        // `+\\frac{${a.abs()}}{${b}} x` : `-\\frac{${a.abs()}}{${b}} x`
        // }
        if (a.gt(0)) return `+\\frac{${a.abs()}}{${b}} x^${index + 1}`;
        else return `-\\frac{${a.abs()}}{${b}} x^${index + 1}`
    });
    const equation = `f(x) = ${terms.join('')}`;

    return `\\displaystyle ${equation}`;
}

function verifyBuilder(yValues) {
    let terms = yValues.map((yValue, index) => {
        return `f(${index + 1}) = ${yValue}, `
    });
    const equation = `${terms.join('')}`;

    return `\\displaystyle ${equation}`;
}
