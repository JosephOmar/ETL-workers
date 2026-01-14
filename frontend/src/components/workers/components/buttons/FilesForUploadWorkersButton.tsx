import { Button } from "@/components/ui/button";

export default function FilesForUploadWorkersButton() {
  return (
    <Button className="bg-green-500 hover:bg-green-700">
      <a
        href="https://drive.google.com/drive/folders/1REU_6zzHwqhcLcwjBeyFaOeYntLBWiq1?usp=sharing"
        target="_blank"
      >
        G Drive
      </a>
    </Button>
  );
}
