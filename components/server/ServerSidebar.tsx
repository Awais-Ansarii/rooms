import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { channelType, memberRole } from "@prisma/client";
import { Channel } from "diagnostics_channel";
import { redirect } from "next/navigation";

import React from "react";
import ServerHeader from "./ServerHeader";
import { ScrollArea } from "../ui/scroll-area";
import ServerSearch from "./ServerSearch";
import { Hash, Icon, Mic, ShieldAlert, ShieldCheck, Video } from "lucide-react";
import { Separator } from "../ui/separator";
import ServerSection from "./ServerSection";
import ServerChannel from "./ServerChannel";
import ServerMember from "./ServerMember";

interface ServerSidebarProps {
  serverId: string;
}

const ServerSidebar = async ({ serverId }: ServerSidebarProps) => {
  const profile = await currentProfile();

  if (!profile) {
    return redirect("/");
  }

  const server = await db.server.findUnique({
    where: {
      id: serverId,
    },
    include: {
      channels: {
        orderBy: {
          createdAt: "asc",
        },
      },
      members: {
        include: {
          profile: true,
        },
        orderBy: {
          role: "asc",
        },
      },
    },
  });

  if (!server) {
    return redirect("/");
  }

  const textChannel = server?.channels?.filter((channel) => {
    return channel.type === channelType.TEXT;
  });
  const audioChannel = server?.channels?.filter((channel) => {
    return channel.type === channelType.AUDIO;
  });
  const videoChannel = server?.channels?.filter((channel) => {
    return channel.type === channelType.VIDEO;
  });

  //find all members excluding ourself
  const members = server?.members?.filter((member) => {
    return member?.profileId !== profile.id;
  });

  // find our role in that particular server
  const role = server?.members?.find((member) => {
    return member?.profileId === profile.id;
  })?.role;
  const IconMap = {
    [channelType.TEXT]: <Hash className="mr-2 size-4" />,
    [channelType.AUDIO]: <Mic className="mr-2 size-4" />,
    [channelType.VIDEO]: <Video className="mr-2 size-4" />,
  };

  const MemberIconMap = {
    [memberRole.GUEST]: null,
    [memberRole.MODERATOR]: (
      <ShieldCheck className="mr-2 size-4 text-indigo-500" />
    ),
    [memberRole.ADMIN]: <ShieldAlert className="mr-2 size-4 text-rose-500" />,
  };
  return (
    <div
      className={cn(
        "flex flex-col text-primary h-full dark:bg-[#2B2D31] bg-[#F2F3F5]"
      )}
    >
      <ServerHeader server={server} role={role} />
      <ScrollArea className="flex-1 px-3">
        <div className="mt-2 ">
          <ServerSearch
            data={[
              {
                label: "Text Channels",
                type: "channel",
                data: textChannel?.map((channel) => {
                  return {
                    icon: IconMap[channel.type],
                    name: channel.name,
                    id: channel.id,
                  };
                }),
              },
              {
                label: "Voice Channels",
                type: "channel",
                data: audioChannel?.map((channel) => {
                  return {
                    icon: IconMap[channel.type],
                    name: channel.name,
                    id: channel.id,
                  };
                }),
              },
              {
                label: "Video Channels",
                type: "channel",
                data: videoChannel?.map((channel) => {
                  return {
                    icon: IconMap[channel.type],
                    name: channel.name,
                    id: channel.id,
                  };
                }),
              },
              {
                label: "Members",
                type: "member",
                data: members?.map((member) => {
                  return {
                    icon: MemberIconMap[member.role],
                    name: member.profile.name,
                    id: member.id,
                  };
                }),
              },
            ]}
          />
        </div>
        <Separator className="my-2 rounded-md bg-zinc-200 dark:bg-zinc-700" />
        {!!textChannel?.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="channels"
              channelType={channelType.TEXT}
              role={role}
              label="Text Channels"
            />

            {textChannel.map((channel, index) => (
              <ServerChannel
                channel={channel}
                server={server}
                role={role}
                key={index}
              />
            ))}
          </div>
        )}

        {!!audioChannel?.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="channels"
              channelType={channelType.AUDIO}
              role={role}
              label="Voice Channels"
            />

            {audioChannel.map((channel, index) => (
              <ServerChannel
                channel={channel}
                server={server}
                role={role}
                key={index}
              />
            ))}
          </div>
        )}
        {/* video channel */}
        {!!videoChannel?.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="channels"
              channelType={channelType.VIDEO}
              role={role}
              label="Video Channels"
            />

            {videoChannel.map((channel, index) => (
              <ServerChannel
                channel={channel}
                server={server}
                role={role}
                key={index}
              />
            ))}
          </div>
        )}

        {/* members */}

        {!!members?.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="members"
              role={role}
              label="Members"
              server={server}
            />

            {members.map((member, index) => (
              <ServerMember key={index} member={member} server={server} />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ServerSidebar;
