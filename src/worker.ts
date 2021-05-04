import { AlgorithmList } from './sorting/AlgorithmList';
import VisualArray, { ArraySnapshot } from './sorting/VisualArray';

const list = new AlgorithmList().list;
onmessage = (message) => {
    const { name, array }: { name: string; array: number[] } = message.data;

    console.log(name);

    const visualArray = new VisualArray(array, snapshotHandler);

    // start sorting!!
    list[name].sort(visualArray);
    visualArray.takeSnapshot(); // last highlighting
    visualArray.takeSnapshot(); // frame w/o highlighting

    self.close();
};

const snapshotHandler = (snapshot: ArraySnapshot) => {
    (self as any).postMessage(snapshot);
};
