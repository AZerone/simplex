var simplex = {
    N: 0, // constraints length
    M: 0, // variables length
    type: 1, //0 = minimum, 1 maximum
    z: {}, // z function
    a: {}, // coefficients
    c: {},
    basis: {},
    sign:{}, // signs
    isBigM: false,
    bigM: 10000,

    create: function () {
        // minimum
        if (this.type == 0) {
            for (var i = 0; i < this.N; i++)
                this.z[i] = -this.z[i];
        }

        // adding slack variables
        for (var i = 0; i < this.N; i++)
            for (var j = 0; j < this.N; j++)
                this.a[i][this.M + j] = 0;

        // setting slack variables to 1
        for (var i = 0; i < this.N; i++) {
            if (this.sign[i] < 0)
                this.a[i][this.M + i] = -1;
            else
                this.a[i][this.M + i] = 1;
        }

        // base variables
        for (var i = 0; i < this.N; i++)
            this.basis[i] = this.M + i;


        this.M += this.N;
        this.a[this.N] = {};
        for (var i = 0; i < this.M; i++) {
            if (this.z[i] === 'undefined' || isNaN(this.z[i]))
                this.z[i] = 0;
            this.a[this.N][i] = -this.z[i];
        }
    },

    solve: function() {
        while (true) {
            var q = this.bland();
            if (q == -1) {
                console.log(this.a);
                console.log("optimal found");
                return "";
                break;
            }
            var p = this.minRatioRule(q);
            if (p == -1) {
                console.log("p = -1 ");
                return;
            }

            this.pivot(p, q);

            this.basis[p] = q;
            //this.calcBottom(initialBottom);

            console.log("A = ", this.a);
            console.log("Basis = ", this.basis);

        }
    },

    bland: function() {  // lowest index of a non-basic column with a positive cost
        for (var i = 0; i < this.M; i++)
            if (this.a[this.N][i] > 0)
                return i;
        return -1; // optimal
    },

    // find row p using min ratio rule (-1 if no such row)
    minRatioRule: function(q) {
        var p = -1;
        for (var i = 0; i < this.N; i++) {
            if (this.a[i][q] <= 0) continue;
            else if (p == -1) p = i;
            else if ((this.a[i][this.M] / this.a[i][q])
                < (this.a[p][this.M] / this.a[p][q]))
                p = i;
        }
        return p;
    },

    // pivot on entry (p, q) using Gauss-Jordan elimination
    pivot: function (p, q) {
        // everything but row p and column q
        for (var i = 0; i <= this.N; i++)
            for (var j = 0; j <= this.M; j++)
                if (i != p && j != q)
                    this.a[i][j] -= this.a[p][j] * this.a[i][q] / this.a[p][q];

        // zero out column q
        for (var i = 0; i <= this.N; i++)
            if (i != p) this.a[i][q] = 0.0;

        // scale row p
        for (var j = 0; j <= this.M; j++)
            if (j != q)
                this.a[p][j] /= this.a[p][q];
        this.a[p][q] = 1.0;
    },

    // pivot on entry (p, q) using Gauss-Jordan elimination to Big N
    pivotBigM: function (p, q) {
        // everything but row p and column q
        var totalLen = 2 * this.N + this.M;
        for (var i = 0; i <= this.N; i++)
            for (var j = 0; j <= totalLen; j++)
                if (i != p && j != q)
                    this.a[i][j] -= this.a[p][j] * this.a[i][q] / this.a[p][q];

        // zero out column q
        for (var i = 0; i <= this.N; i++)
            if (i != p) this.a[i][q] = 0.0;

        // scale row p
        for (var j = 0; j <= totalLen; j++)
            if (j != q)
                this.a[p][j] /= this.a[p][q];
        this.a[p][q] = 1.0;
    },

    isEqual: function (a, b) {
        var totalLen = this.N + this.M;
        if (this.bigM)
            totalLen += this.N;
        for (var i = 0; i < totalLen; i++) {
            if (a[i] != b[i])
                return false;
        }
        return true;
    },

    answer: function () {
        var s = "Optimal solution is ";
        var result = 0;
        var totalLen = this.N + this.M;
        if (this.bigM)
            totalLen += this.N;
        for (var i = 0; i < this.N; i++)
            result += this.a[i][this.M] * this.z[this.basis[i]];
        s += Math.abs(result) + "<br />";

        for (var i = 0; i < this.M; i++) {
            var f = 0;
            for (var j = 0; j < this.N; j++) {
                if (this.basis[j] == i) {
                    f = this.a[j][this.M + this.N];
                }
            }
            s += "x" + (i+1) + "=" + f + "<br />";
        }

        return s;
    }

}