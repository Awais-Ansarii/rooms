"use client";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FileUpload from "../common/FileUpload";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useModalStore } from "@/hooks/useModalStore";

const CreateServerModal = () => {


  const { type, isOpen, onOpen, onClose } = useModalStore();

    const isModalOpen = isOpen && type === "createServer";

  const router = useRouter();
  const formSchema = z.object({
    name: z.string().min(1, {
      message: "Server Name is required",
    }),
    imageUrl: z.string().min(1, {
      message: "Server Image is required",
    }),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      imageUrl: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // console.log(`values == `, values);
    try {
      const request = await axios.post("/api/servers", values);
      // console.log(`request == `, request);
      form.reset();
      router.refresh();
      onClose();
    } catch (error) {
      console.log(`error == `, error);
    }
  };

  const handleClose = ()=>{
    form.reset();
    onClose();
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-8">
          <DialogTitle className="text-center text-2xl">
            Customize your Server
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Give your server a name and a profile picture. You can always change
            this later.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 px-6">
              <div className="flex justify-center items-center text-center">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    // console.log(`field value`, field.value);
                    <FormItem>
                      <FormControl>
                        <FileUpload
                          endPoint="serverImage"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase font-bold text-zinc-500 dark:text-secondary/70">
                      Server Name
                    </FormLabel>
                    <FormControl className="">
                      <Input
                        disabled={isLoading}
                        className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                        placeholder="Enter Server Name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="bg-gray-100 px-6 py-4">
              <Button disabled={isLoading} variant={"primary"}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
export default CreateServerModal;
