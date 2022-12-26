import clsx from 'clsx';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { createImage, createURL, Props } from './lib/image';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { debounce, throttle } from 'lodash-es';

const useParams = () => {
  return useMemo(() => {
    const url = new URL(window.location.href);
    return url.searchParams;
  }, []);
};

function App() {
  const params = useParams();
  const [props, setProps] = useState<Props>({
    name: params.get('name') ?? undefined,
    price:
      params.get('price') && isNaN(Number(params.get('price')))
        ? Number(params.get('price'))
        : 5000,
    message: params.get('message') ?? undefined,
  });
  const canShare = useMemo(() => {
    return 'share' in navigator;
  }, []);
  const onShare = useCallback(async () => {
    if (canShare) {
      navigator.share({});
    } else {
      const res = await fetch(createURL(props));
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const download = document.createElement('a');
      download.href = url;
      download.download = 'superChat.png';
      download.click();
    }
  }, [canShare, props]);

  return (
    <div
      className={clsx(
        'flex',
        'h-full',
        'pt-10',
        'md:pt-0',
        'md:items-center',
        'justify-center'
      )}
    >
      <div
        className={clsx(
          'w-full',
          'md:max-w-[337px]',
          'box-content',
          'mx-auto',
          'px-5',
          'md:py-10',
          'md:px-10',
          'rounded-lg',
          'md:shadow-lg',
          'bg-gray-200',
          'dark:bg-gray-900'
        )}
      >
        <div className={clsx('flex', 'flex-col', 'items-center', 'space-y-4')}>
          <h1 className={clsx('text-4xl')}>Super Chat Maker</h1>
          <SuperChatImage imgProps={props} />
          <Form defaultValues={props} onSubmit={setProps} />
          <button
            className={clsx('w-full', 'py-2', 'bg-blue-500', 'text-black')}
            onClick={onShare}
          >
            {canShare ? 'SNSでシェア' : '画像を保存'}
          </button>
        </div>
      </div>
    </div>
  );
}

const Form: FC<{
  defaultValues: Partial<Props>;
  onSubmit: (props: Props) => void;
}> = ({ defaultValues, onSubmit }) => {
  const methods = useForm<Props>({
    defaultValues,
  });
  const { handleSubmit, register, watch } = methods;
  const onChange = useMemo(() => {
    return debounce(handleSubmit(onSubmit), 100);
  }, []);

  return (
    <FormProvider {...methods}>
      <form className={clsx('w-full', 'px-2')} onChange={onChange}>
        <div className={clsx('flex', 'flex-row', 'space-x-4', 'items-center')}>
          <div className={clsx('py-2')}>
            <IconFileInput />
          </div>
          <div className={clsx('py-2', 'grow')}>
            <label>名前</label>
            <input
              className={clsx(
                'w-full',
                'border-b',
                'border-b-gray-900',
                'dark:border-b-gray-400',
                'outline-none',
                'focus:border-b-gray-700',
                'dark:focus:border-b-gray-200'
              )}
              placeholder="名前を入力してください"
              {...register('name')}
            />
          </div>
        </div>
        <div className={clsx('py-2')}>
          <label>メッセージ</label>
          <input
            className={clsx(
              'w-full',
              'border-b',
              'border-b-gray-900',
              'dark:border-b-gray-400',
              'outline-none',
              'focus:border-b-gray-700',
              'dark:focus:border-b-gray-200',
              'disabled:text-gray-500'
            )}
            placeholder="メッセージを入力してください"
            disabled={watch('price') < 200}
            {...register('message')}
          />
        </div>
        <PriceRangeForm />
      </form>
    </FormProvider>
  );
};

const IconFileInput = () => {
  const { register, watch } = useFormContext<Props>();
  const icon = watch('icon');
  const iconSrc = useMemo(() => {
    const file = icon?.item(0);

    if (!file) {
      return null;
    }

    return URL.createObjectURL(file);
  }, [icon]);

  return (
    <label
      className={clsx(
        'block',
        'w-10',
        'h-10',
        'rounded-full',
        'outline-none',
        'bg-gray-500',
        'overflow-hidden'
      )}
    >
      {iconSrc ? (
        <img className={clsx('w-full', 'h-full')} src={iconSrc} />
      ) : (
        <div
          className={clsx(
            'w-full',
            'h-full',
            'flex',
            'items-center',
            'justify-center',
            'text-black',
            'text-opacity-50',
            'text-2xl'
          )}
        >
          ？
        </div>
      )}
      <input hidden type="file" {...register('icon')} />
    </label>
  );
};

const RANGE_VALUE = [
  100, 200, 500, 1000, 2000, 5000, 10000, 20000, 30000, 40000, 50000,
];
const PriceRangeForm: FC = () => {
  const { register, setValue, watch } = useFormContext<Props>();
  const [priceRange, setPriceRange] = useState(0);
  const onChangeRange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.currentTarget.valueAsNumber;
      setValue('price', RANGE_VALUE[value]);
      setPriceRange(value);
    },
    []
  );

  const price = watch('price');
  useEffect(() => {
    setPriceRange(() => {
      const range = RANGE_VALUE.filter((x) => price >= x);
      return range.length - 1;
    });
  }, [price]);

  return (
    <div
      className={clsx(
        'w-full',
        'flex',
        'flex-col',
        'space-y-1',
        'items-center',
        'py-2'
      )}
    >
      <div
        className={clsx(
          'text-lg',
          'flex',
          'flex-row',
          'items-center',
          'justify-center',
          'w-full'
        )}
      >
        <span>￥</span>
        <input
          className={clsx(
            'w-full',
            'px-2',
            'border-b',
            'border-b-gray-900',
            'dark:border-b-gray-400',
            'focus:border-b-gray-700',
            'dark:focus:border-b-gray-200',
            'outline-none'
          )}
          min="100"
          max="50000"
          inputMode="numeric"
          {...register('price')}
        />
        <span>JPY</span>
      </div>
      <label className={clsx('w-full', 'flex', 'items-center', 'py-2')}>
        <input
          className={clsx('w-full', 'h-[2px]', 'bg-white')}
          type="range"
          min="0"
          max="10"
          value={priceRange}
          onChange={onChangeRange}
        />
      </label>
    </div>
  );
};

const SuperChatImage: FC<{ imgProps: Props }> = ({ imgProps }) => {
  const [isLoaded, setIsLoaded] = useState<WeakMap<Props, boolean>>(
    new WeakMap()
  );
  const [imageUrl, setImageUrl] = useState('');
  useEffect(() => {
    setIsLoaded((x) => x.set(imgProps, false));
    createImage(imgProps).then((url) => {
      setImageUrl(url);
      setIsLoaded((x) => x.set(imgProps, true));
    });
  }, [imgProps]);

  return (
    <img
      width="337"
      height="56"
      className={clsx('transition', 'bg-gray-200', 'dark:bg-gray-800', {
        'blur-sm': !isLoaded.get(imgProps),
        'opacity-90': !isLoaded.get(imgProps),
      })}
      src={imageUrl}
    />
  );
};

export default App;
