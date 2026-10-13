import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut, Crown } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserInfo {
  nickname: string;
  avatarUrl: string;
  planType: 'free' | 'vip' | 'lifetime';
  endDate: string | null;
  remainingUses: number;
}

export default function UserMenu() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/user/info', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch user info');
      const data = await response.json();
      setUserInfo(data);
    } catch (error) {
      console.error('Fetch user info error:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  const getPlanLabel = (planType: string) => {
    switch (planType) {
      case 'free':
        return '免费用户';
      case 'vip':
        return 'VIP会员';
      case 'lifetime':
        return '终身会员';
      default:
        return '未知';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '永久有效';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!userInfo) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar className="h-8 w-8">
          <AvatarImage src={userInfo.avatarUrl} />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center justify-start gap-2 p-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={userInfo.avatarUrl} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-sm font-medium">{userInfo.nickname}</p>
            <p className="text-xs text-muted-foreground">
              {getPlanLabel(userInfo.planType)}
            </p>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        {/* 会员信息区域 */}
        <div className="p-2 space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Crown className="h-3.5 w-3.5" />
            <span>
              {userInfo.planType === 'free' ? (
                '免费用户'
              ) : (
                <>
                  到期时间：
                  <span className="text-foreground">
                    {formatDate(userInfo.endDate)}
                  </span>
                </>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-block w-3.5 h-3.5 text-center font-bold">
              #
            </span>
            <span>
              剩余次数：
              <span className="text-foreground font-medium">
                {userInfo.remainingUses}
              </span>
            </span>
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="text-destructive focus:text-destructive cursor-pointer"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>退出登录</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 