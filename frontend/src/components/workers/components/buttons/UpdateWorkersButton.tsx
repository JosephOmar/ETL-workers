import { Button } from "@/components/ui/button"

interface Props {
    onAfterUpdate: () => void;
}
export default function UpdateWorkersButton({onAfterUpdate} : Props) {

    const handleUpdate = () => {
        onAfterUpdate && onAfterUpdate()
    }
    return (
        <Button onClick={handleUpdate}>
            Update Workers
        </Button>
    )
}