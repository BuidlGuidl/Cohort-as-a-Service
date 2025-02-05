type TokenBalanceProps = {
  balance: number;
  tokenSymbol: string;
  className?: string;
};

export const TokenBalance = ({ balance, tokenSymbol, className }: TokenBalanceProps) => {
  return (
    <button
      className={`btn btn-sm btn-ghost flex flex-col font-normal items-center hover:bg-transparent ${className}`}
      type="button"
    >
      <div className="w-full flex items-center">
        <>
          <span> {balance?.toFixed(2)}</span>
          <div className="ml-1">{tokenSymbol}</div>
        </>
      </div>
    </button>
  );
};
