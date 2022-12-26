const END_POINT = 'https://superchat-img.vercel.app/super-chat';

export type Props = {
  name?: string;
  icon?: FileList;
  price: number;
  message?: string;
};

export const createURL = (props: Props) => {
  const url = new URL(END_POINT);
  Object.entries(props).forEach(([k, v]) => {
    if (v) {
      url.searchParams.set(k, v.toString());
    }
  });

  return url.href;
};

export const createImage = async (props: Props) => {
  const form = new FormData();
  props.name ? form.set('name', props.name) : form.set('name', 'Anonymous');
  props.price && form.set('price', props.price.toString());
  props.message && form.set('message', props.message);
  {
    const icon = props.icon && props.icon.item(0);
    icon && form.set('icon', icon);
  }

  const res = await fetch(END_POINT, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    throw new Error('failed request');
  }

  const blob = await res.blob();
  return URL.createObjectURL(blob);
};
