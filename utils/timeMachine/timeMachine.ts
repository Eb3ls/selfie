class TimeMachine {
	private static instance: TimeMachine;
	public timeMachineTime: Date;

	private constructor() {
		this.timeMachineTime = new Date();
	}

	public static getInstance(): TimeMachine {
		if (!TimeMachine.instance) {
			TimeMachine.instance = new TimeMachine();
		}
		return TimeMachine.instance;
	}
}

const timeMachine = TimeMachine.getInstance();
export { timeMachine };
