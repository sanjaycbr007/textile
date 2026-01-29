// Worker.js - Data model for workers

class Worker {
    constructor(code, name, role, contact, dailyWage, shiftWage) {
        this.code = code;
        this.name = name;
        this.role = role;
        this.contact = contact;
        this.daily_wage = dailyWage;
        this.shift_wage = shiftWage || 0;
        this.status = 'active';
        this.created_at = new Date();
        this.updated_at = new Date();
    }

    // Validate worker data
    static validate(workerData) {
        const errors = [];

        if (!workerData.code || workerData.code.trim() === '') {
            errors.push('Employee code is required');
        }

        if (!workerData.name || workerData.name.trim() === '') {
            errors.push('Worker name is required');
        }

        if (!workerData.role || workerData.role.trim() === '') {
            errors.push('Worker role is required');
        }

        if (!workerData.daily_wage || workerData.daily_wage <= 0) {
            errors.push('Daily wage must be greater than 0');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Calculate monthly wages
    static calculateMonthlyWage(worker, attendanceRecords) {
        let totalWage = 0;
        
        attendanceRecords.forEach(record => {
            if (record.status === 'Present') {
                totalWage += worker.daily_wage;
            } else if (record.status === 'Half Day') {
                totalWage += worker.daily_wage / 2;
            }
        });

        return totalWage;
    }

    // Get role categories
    static getRoleCategories() {
        return [
            'Tailor',
            'Cutter',
            'Helper',
            'Machine Operator',
            'Packer',
            'Supervisor'
        ];
    }
}

module.exports = Worker;
