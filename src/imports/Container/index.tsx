import svgPaths from "./svg-4wvv6tow1a";

function Container4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <p className="[word-break:break-word] font-['Noto_Sans_SC:Bold',sans-serif] font-bold leading-[15px] relative shrink-0 text-[10px] text-[rgba(255,215,0,0.6)] tracking-[2px] uppercase whitespace-nowrap">激活卡获取通道</p>
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-col h-[28px] items-start pt-[6px] relative shrink-0 w-[128.97px]" data-name="Container">
      <p className="[word-break:break-word] font-['Noto_Sans_SC:Black',sans-serif] font-black leading-[22px] relative shrink-0 text-[22px] text-white tracking-[-0.5px] whitespace-nowrap">获得新激活卡</p>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[128.97px]" data-name="Container">
      <Container4 />
      <Container5 />
    </div>
  );
}

function Container6() {
  return (
    <div className="bg-[rgba(255,215,0,0.1)] border-[1.515px] border-[rgba(255,215,0,0.2)] border-solid content-stretch flex flex-col items-start px-[14px] py-[6px] relative rounded-[8px] shrink-0" data-name="Container">
      <p className="[word-break:break-word] font-['Noto_Sans_SC:Bold',sans-serif] font-bold leading-[18px] relative shrink-0 text-[#ffd700] text-[12px] whitespace-nowrap">年度激活卡 · ¥500</p>
    </div>
  );
}

function ContainerAlign() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-start justify-end min-w-px relative" data-name="Container:align">
      <Container6 />
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex gap-[12px] items-end relative shrink-0 w-full" data-name="Container">
      <Container3 />
      <ContainerAlign />
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[21.988px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" height="21.9882" preserveAspectRatio="none" viewBox="0 0 21.9882 21.9882" width="21.9882">
        <g id="Icon">
          <path d={svgPaths.p2adfa00} id="Vector" stroke="#FB923C" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.64911" />
        </g>
      </svg>
    </div>
  );
}

function Container9() {
  return (
    <div className="bg-[rgba(251,146,60,0.2)] border-[1.515px] border-[rgba(251,146,60,0.35)] border-solid content-stretch flex items-center justify-center relative rounded-[12px] shrink-0 size-[44px]" data-name="Container">
      <Icon />
    </div>
  );
}

function ContainerMargin1() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[14px] relative shrink-0" data-name="Container:margin">
      <Container9 />
    </div>
  );
}

function Container10() {
  return <div className="content-stretch flex flex-col h-[19px] items-start pb-[6px] relative shrink-0 w-[363px]" data-name="Container" />;
}

function Container11() {
  return (
    <div className="content-stretch flex flex-col h-[34.941px] items-start pb-[6.988px] relative shrink-0 w-[143.258px]" data-name="Container">
      <p className="[word-break:break-word] font-['Noto_Sans_SC:Bold',sans-serif] font-extrabold leading-[27.953px] relative shrink-0 text-[18.635px] text-white whitespace-nowrap">积分</p>
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex flex-col h-[34.941px] items-start pb-[6.988px] relative shrink-0 w-[143.258px]" data-name="Container">
      <p className="[word-break:break-word] font-['Noto_Sans_SC:Bold',sans-serif] font-extrabold leading-[27.953px] relative shrink-0 text-[18.635px] text-white whitespace-nowrap">余额兑换</p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0">
      <Container11 />
      <Container12 />
    </div>
  );
}

function Container13() {
  return (
    <div className="[word-break:break-word] h-[37px] relative shrink-0 tracking-[-0.5px] w-full" data-name="Container">
      <p className="absolute font-['JetBrains_Mono:ExtraBold',sans-serif] font-black leading-[36px] left-[-20.77px] text-[#f4c993] text-[24px] top-[0.49px] w-[78px]">5,000</p>
      <p className="absolute font-['JetBrains_Mono:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium leading-[18px] left-[76.49px] text-[#ff8c00] text-[12px] top-[14.12px] whitespace-nowrap">/ 张</p>
    </div>
  );
}

function ContainerMargin2() {
  return (
    <div className="content-stretch flex flex-col h-[36px] items-start pb-[16px] relative shrink-0 w-full" data-name="Container:margin">
      <Container13 />
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex flex-col h-[68px] items-start relative shrink-0 w-[153px]">
      <ContainerMargin2 />
      <div className="[word-break:break-word] flex flex-col font-['Noto_Sans_SC:Regular',sans-serif] font-normal h-[31px] justify-center leading-[0] relative shrink-0 text-[12px] text-[rgba(255,255,255,0.45)] w-[153px]">
        <p className="leading-[19.2px]">可用余额：8000 积分</p>
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex gap-[67px] items-start relative shrink-0">
      <Frame1 />
      <Frame />
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[#ffd700] content-stretch flex flex-col items-center justify-center py-[11px] relative rounded-[9px] shrink-0 w-[363.172px]" data-name="Button">
      <p className="[word-break:break-word] font-['Noto_Sans_SC:Bold',sans-serif] font-extrabold leading-[21px] relative shrink-0 text-[#1c1c2e] text-[14px] text-center tracking-[0.3px] whitespace-nowrap">立即兑换</p>
    </div>
  );
}

function ButtonAlign() {
  return (
    <div className="content-stretch flex flex-col h-[76px] items-start justify-end relative shrink-0" data-name="Button:align">
      <Button />
    </div>
  );
}

function Container8() {
  return (
    <div className="bg-[rgba(255,255,255,0.05)] border-[1.515px] border-[rgba(255,215,0,0.2)] border-solid col-3 content-stretch flex flex-col h-[286px] items-start px-[20px] py-[22px] relative rounded-[13px] row-1 shrink-0 w-[406.201px]" data-name="Container">
      <ContainerMargin1 />
      <Container10 />
      <Frame2 />
      <ButtonAlign />
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[21.988px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" height="21.9882" preserveAspectRatio="none" viewBox="0 0 21.9882 21.9882" width="21.9882">
        <g id="Icon">
          <path d={svgPaths.p3e406e80} id="Vector" stroke="#A78BFA" strokeLinecap="round" strokeWidth="1.64911" />
          <path d={svgPaths.p2386b700} id="Vector_2" stroke="#A78BFA" strokeLinecap="round" strokeWidth="1.64911" />
        </g>
      </svg>
    </div>
  );
}

function Container15() {
  return (
    <div className="bg-[rgba(124,58,237,0.25)] border-[1.515px] border-[rgba(124,58,237,0.4)] border-solid content-stretch flex items-center justify-center relative rounded-[12px] shrink-0 size-[44px]" data-name="Container">
      <Icon1 />
    </div>
  );
}

function ContainerMargin3() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[14px] relative shrink-0" data-name="Container:margin">
      <Container15 />
    </div>
  );
}

function Container16() {
  return <div className="content-stretch flex flex-col h-[19px] items-start pb-[6px] relative shrink-0 w-[363px]" data-name="Container" />;
}

function Container17() {
  return (
    <div className="content-stretch flex flex-col h-[34.941px] items-start pb-[6.988px] relative shrink-0 w-[143.258px]" data-name="Container">
      <p className="[word-break:break-word] font-['Noto_Sans_SC:Bold',sans-serif] font-extrabold leading-[27.953px] relative shrink-0 text-[18.635px] text-white whitespace-nowrap">云币</p>
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex flex-col h-[34.941px] items-start pb-[6.988px] relative shrink-0 w-[143.258px]" data-name="Container">
      <p className="[word-break:break-word] font-['Noto_Sans_SC:Bold',sans-serif] font-extrabold leading-[27.953px] relative shrink-0 text-[18.635px] text-white whitespace-nowrap">余额兑换</p>
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0">
      <Container17 />
      <Container18 />
    </div>
  );
}

function Container19() {
  return (
    <div className="[word-break:break-word] h-[37px] relative shrink-0 text-[#a5bfff] tracking-[-0.5px] w-full" data-name="Container">
      <p className="absolute font-['JetBrains_Mono:ExtraBold',sans-serif] font-black leading-[36px] left-[0.49px] text-[24px] top-[0.12px] w-[57px]">500</p>
      <p className="absolute font-['JetBrains_Mono:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium leading-[18px] left-[76.49px] text-[12px] top-[14.12px] whitespace-nowrap">/ 张</p>
    </div>
  );
}

function ContainerMargin4() {
  return (
    <div className="content-stretch flex flex-col h-[36px] items-start pb-[16px] relative shrink-0 w-full" data-name="Container:margin">
      <Container19 />
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex flex-col h-[68px] items-start relative shrink-0 w-[153px]">
      <ContainerMargin4 />
      <div className="[word-break:break-word] flex flex-col font-['Noto_Sans_SC:Regular',sans-serif] font-normal h-[31px] justify-center leading-[0] relative shrink-0 text-[12px] text-[rgba(255,255,255,0.45)] w-[107px]">
        <p className="leading-[19.2px]">可用余额：800 云币</p>
      </div>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex gap-[67px] items-start relative shrink-0">
      <Frame4 />
      <Frame5 />
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#ffd700] content-stretch flex flex-col items-center justify-center py-[11px] relative rounded-[9px] shrink-0 w-[363.172px]" data-name="Button">
      <p className="[word-break:break-word] font-['Noto_Sans_SC:Bold',sans-serif] font-extrabold leading-[21px] relative shrink-0 text-[#1c1c2e] text-[14px] text-center tracking-[0.3px] whitespace-nowrap">立即兑换</p>
    </div>
  );
}

function ButtonAlign1() {
  return (
    <div className="content-stretch flex flex-col h-[76px] items-start justify-end relative shrink-0" data-name="Button:align">
      <Button1 />
    </div>
  );
}

function Container14() {
  return (
    <div className="bg-[rgba(255,255,255,0.05)] border-[1.515px] border-[rgba(255,215,0,0.2)] border-solid col-2 content-stretch flex flex-col h-[286px] items-start px-[20px] py-[22px] relative rounded-[13px] row-1 shrink-0 w-[406.201px]" data-name="Container">
      <ContainerMargin3 />
      <Container16 />
      <Frame3 />
      <ButtonAlign1 />
    </div>
  );
}

function Icon2() {
  return (
    <div className="relative shrink-0 size-[21.988px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" height="21.9882" preserveAspectRatio="none" viewBox="0 0 21.9882 21.9882" width="21.9882">
        <g clipPath="url(#clip0_0_4)" id="Icon">
          <path d={svgPaths.p583cc80} id="Vector" stroke="#FFD700" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.64911" />
          <path d={svgPaths.p3206f630} id="Vector_2" stroke="#FFD700" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.64911" />
          <path d={svgPaths.p2e8a77c0} id="Vector_3" stroke="#FFD700" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.64911" />
        </g>
        <defs>
          <clipPath id="clip0_0_4">
            <rect fill="white" height="21.9882" width="21.9882" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container21() {
  return (
    <div className="bg-[rgba(255,215,0,0.15)] border-[1.515px] border-[rgba(255,215,0,0.3)] border-solid content-stretch flex items-center justify-center relative rounded-[12px] shrink-0 size-[44px]" data-name="Container">
      <Icon2 />
    </div>
  );
}

function ContainerMargin5() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[14px] relative shrink-0" data-name="Container:margin">
      <Container21 />
    </div>
  );
}

function Container22() {
  return <div className="content-stretch flex flex-col h-[19px] items-start pb-[6px] relative shrink-0 w-[363px]" data-name="Container" />;
}

function Container23() {
  return (
    <div className="content-stretch flex flex-col h-[34.941px] items-start pb-[6.988px] relative shrink-0 w-[143.258px]" data-name="Container">
      <p className="[word-break:break-word] font-['Noto_Sans_SC:Bold',sans-serif] font-extrabold leading-[27.953px] relative shrink-0 text-[18.635px] text-white whitespace-nowrap">官方购买</p>
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex flex-col h-[34.941px] items-start pb-[6.988px] relative shrink-0 w-[143.258px]" data-name="Container">
      <p className="[word-break:break-word] font-['Noto_Sans_SC:Bold',sans-serif] font-extrabold leading-[27.953px] relative shrink-0 text-[18.635px] text-white whitespace-nowrap">终端激活年卡</p>
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0">
      <Container23 />
      <Container24 />
    </div>
  );
}

function Container25() {
  return (
    <div className="[word-break:break-word] h-[37px] relative shrink-0 tracking-[-0.5px] w-full" data-name="Container">
      <p className="absolute font-['JetBrains_Mono:ExtraBold',sans-serif] font-black leading-[36px] left-[0.49px] text-[#ffd700] text-[24px] top-[0.12px] w-[57px]">$500</p>
      <p className="absolute font-['JetBrains_Mono:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium leading-[18px] left-[76.49px] text-[12px] text-[rgba(255,215,0,0.5)] top-[14.12px] whitespace-nowrap">/ 张</p>
    </div>
  );
}

function ContainerMargin6() {
  return (
    <div className="content-stretch flex flex-col h-[36px] items-start pb-[16px] relative shrink-0 w-full" data-name="Container:margin">
      <Container25 />
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex flex-col h-[68px] items-start relative shrink-0 w-[153px]">
      <ContainerMargin6 />
      <p className="[word-break:break-word] font-['Noto_Sans_SC:Regular',sans-serif] font-normal leading-[19.2px] relative shrink-0 text-[12px] text-[rgba(255,255,255,0.45)] whitespace-nowrap">银行卡、加密货币 USDT</p>
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex gap-[67px] items-start relative shrink-0">
      <Frame7 />
      <Frame8 />
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-[#ffd700] content-stretch flex flex-col items-center justify-center py-[11px] relative rounded-[9px] shrink-0 w-[363.172px]" data-name="Button">
      <p className="[word-break:break-word] font-['Noto_Sans_SC:Bold',sans-serif] font-extrabold leading-[21px] relative shrink-0 text-[#1c1c2e] text-[14px] text-center tracking-[0.3px] whitespace-nowrap">立即购买</p>
    </div>
  );
}

function ButtonAlign2() {
  return (
    <div className="content-stretch flex flex-col h-[76px] items-start justify-end relative shrink-0" data-name="Button:align">
      <Button2 />
    </div>
  );
}

function Container20() {
  return (
    <div className="bg-[rgba(255,255,255,0.05)] border-[1.515px] border-[rgba(255,215,0,0.2)] border-solid col-1 content-stretch flex flex-col h-[286px] items-start px-[20px] py-[22px] relative rounded-[13px] row-1 shrink-0 w-[406.201px]" data-name="Container">
      <ContainerMargin5 />
      <Container22 />
      <Frame6 />
      <ButtonAlign2 />
    </div>
  );
}

function Container7() {
  return (
    <div className="gap-x-[14px] gap-y-[14px] grid grid-cols-[repeat(3,minmax(0,1fr))] grid-rows-[repeat(2,minmax(0,1fr))] h-[634.734px] relative shrink-0 w-full" data-name="Container">
      <Container8 />
      <Container14 />
      <Container20 />
    </div>
  );
}

function ContainerMargin() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[24px] relative shrink-0 w-full" data-name="Container:margin">
      <Container7 />
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-col h-[502px] items-start px-[32px] py-[28px] relative shrink-0 w-full" data-name="Container">
      <Container2 />
      <ContainerMargin />
    </div>
  );
}

function Container26() {
  return <div className="absolute border-[39.385px] border-[rgba(255,215,0,0.04)] border-solid left-[1070.58px] rounded-[150px] size-[300px] top-[-60px]" data-name="Container" />;
}

function Container27() {
  return <div className="absolute border-[19.692px] border-[rgba(124,58,237,0.07)] border-solid left-[1110.58px] rounded-[80px] size-[160px] top-[-20px]" data-name="Container" />;
}

function Container28() {
  return <div className="absolute border-[28.781px] border-[rgba(255,140,0,0.05)] border-solid left-[-68px] rounded-[100px] size-[200px] top-[302px]" data-name="Container" />;
}

export default function Container() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[16px] size-full" style={{ backgroundImage: "linear-gradient(154.72100915417553deg, rgb(8, 15, 32) 6.1733%, rgb(15, 31, 74) 45.617%, rgb(26, 10, 58) 93.827%)" }} data-name="Container">
      <Container1 />
      <Container26 />
      <Container27 />
      <Container28 />
    </div>
  );
}