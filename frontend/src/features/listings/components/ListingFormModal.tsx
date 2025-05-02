import { Button, ButtonProps, Modal } from "@mui/material";
import { ToggleClickProps } from "../../../constants";
import { useToggleState } from "../../../hooks/useToggleState";
import ListingForm from "./ListingForm";
import PopUp from "../../../components/PopUp/PopUp";

export default function ListingFormModal({ clickProps, buttonProps }: { clickProps?: ToggleClickProps, buttonProps?: ButtonProps }) {
    if (clickProps) {
        return (
            <>
                <Button onClick = { clickProps.onOpen } { ...buttonProps }>
                    Create Listing
                </Button>
                <Modal open = { clickProps.isOpen } onClose = { clickProps.onClose }>
                    <PopUp>
                        <ListingForm />
                    </PopUp>
                </Modal>
            </>
        );
    }

    const [isOpen, toggleIsOpen] = useToggleState(false);

    return (
        <>
            <Button onClick = { toggleIsOpen } { ...buttonProps }>
                Create Listing
            </Button>
            <Modal open = { isOpen } onClose = { toggleIsOpen }>
                <PopUp size = "md">
                    <ListingForm gridProps = {{
                        sx: {
                            width: "90%",
                        }
                    }} />
                </PopUp>
            </Modal>
        </>
    )
}