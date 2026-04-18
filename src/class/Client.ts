export class Client {
    public uid: string;
    public Kmaster: Buffer;

    constructor(uid: string, Kmaster: Buffer) {
        this.uid = uid;
        this.Kmaster = Kmaster;
    }
}
